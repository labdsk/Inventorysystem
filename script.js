// inventory1.js
// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBvTmuQ1H82S0XVru162qDG-JvTyfBhrRU",
    authDomain: "inventory-syatem.firebaseapp.com",
    databaseURL: "https://inventory-syatem-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "inventory-syatem",
    storageBucket: "inventory-syatem.appspot.com",
    messagingSenderId: "911339452714",
    appId: "1:911339452714:web:6fdd5977e4e8cc0b828653",
    measurementId: "G-RT6WCYVJ1R"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const user1Ref = database.ref('user1'); // Reference to the user1 node directly

const inventoryRef = user1Ref.child('inventory');

const inventoryForm = document.getElementById('inventoryForm');
const inventoryList = document.querySelector('#inventoryList tbody');
const deletedItemList = document.querySelector('#deletedItemList tbody');

// Handle inventory form submission
inventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const itemName = document.getElementById('itemName').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    if (itemName && quantity) {
        inventoryRef.push({
            itemName: itemName,
            quantity: quantity,
        });
        inventoryForm.reset();
    }
});

// Listen for changes in the inventory
inventoryRef.on('value', (snapshot) => {
    updateInventoryList(snapshot);
});

// Listen for changes in the deleted items
// Assuming you don't have a 'deleted_items' node directly under user1
// If you have, adjust this accordingly
const deletedItemsRef = user1Ref.child('deleted_items');
deletedItemsRef.on('value', (snapshot) => {
    updateDeletedItemList(snapshot);
});

// Function to update the inventory list
function updateInventoryList(snapshot) {
    inventoryList.innerHTML = '';
    let index = 1;
    snapshot.forEach((childSnapshot) => {
        const item = childSnapshot.val();
        const itemKey = childSnapshot.key;
        const row = createTableRow(item, itemKey, index++);
        inventoryList.appendChild(row);
    });
    applyEditableListeners();
}

// Function to update the deleted item list
function updateDeletedItemList(snapshot) {
    deletedItemList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const item = childSnapshot.val();
        const itemKey = childSnapshot.key;
        const row = createDeletedItemRow(item, itemKey);
        deletedItemList.appendChild(row);
    });
}

// Function to create a table row for inventory items
function createTableRow(item, itemKey, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${index}</td>
        <td class="editable" data-item-key="${itemKey}" data-field="itemName">${item.itemName}</td>
        <td class="editable" data-item-key="${itemKey}" data-field="quantity">${item.quantity}</td>
        <td class="editable" data-item-key="${itemKey}" data-field="report">${item.report ? item.report : ''}</td>
        <td class="editable" data-item-key="${itemKey}" data-field="note">${item.note ? item.note : ''}</td>
        <td>
            <button class="delete-button" data-item-key="${itemKey}">Delete</button>
        </td>`;
    return row;
}

// Function to create a table row for deleted items
function createDeletedItemRow(item, itemKey) {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td class="deleted-item" data-item-key="${itemKey}" data-field="itemName">${item.itemName}</td>
    <td class="deleted-item" data-item-key="${itemKey}" data-field="quantity">${item.quantity}</td>
    <td>
        <button class="restore-button" data-item-key="${itemKey}">Restore</button>
        <button class="delete-permanently-button" data-item-key="${itemKey}">Delete Permanently</button>
    </td>`;
    return row;
}

// Function to apply editable listeners
function applyEditableListeners() {
    const editableCells = document.querySelectorAll('.editable');
    editableCells.forEach(cell => {
        const isQuantityCell = cell.getAttribute('data-field') === 'quantity';
        cell.addEventListener('click', (e) => {
            const input = document.createElement('input');
            const defaultValue = e.target.innerText === '' ? '' : e.target.innerText;
            input.value = defaultValue;
            e.target.innerText = ''; // Clear the default text here
            e.target.appendChild(input);
            input.focus();
            if (isQuantityCell) {
                input.addEventListener('input', (event) => {
                    // Allow only numeric values
                    event.target.value = event.target.value.replace(/\D/, '');
                });
            }
            input.addEventListener('blur', () => {
                const newValue = input.value;
                const itemKey = e.target.getAttribute('data-item-key');
                const field = e.target.getAttribute('data-field');
                inventoryRef.child(itemKey).update({
                    [field]: newValue
                });
                e.target.innerText = newValue || '';
            });
        });
    });
}

// Initial setup of editable listeners
applyEditableListeners();

// Event delegation for delete, restore, and delete permanently buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-button')) {
        const itemKey = e.target.getAttribute('data-item-key');
        if (itemKey) {
            const itemRef = inventoryRef.child(itemKey);
            itemRef.once('value', (snapshot) => {
                const item = snapshot.val();
                deletedItemsRef.push(item); // Move item to deleted items
                itemRef.remove(); // Remove from inventory
            });
        }
    } else if (e.target.classList.contains('restore-button')) {
        const itemKey = e.target.getAttribute('data-item-key');
        if (itemKey) {
            const itemRef = deletedItemsRef.child(itemKey);
            itemRef.once('value', (snapshot) => {
                const item = snapshot.val();
                inventoryRef.push(item); // Restore to inventory
                itemRef.remove(); // Remove from deleted items
            });
        }
    } else if (e.target.classList.contains('delete-permanently-button')) {
        const itemKey = e.target.getAttribute('data-item-key');
        if (itemKey) {
            deletedItemsRef.child(itemKey).remove(); // Remove permanently from deleted items
        }
    }
});

// Function to toggle between pages
function togglePages() {
    document.getElementById('page1').classList.toggle('hidden');
    document.getElementById('page2').classList.toggle('hidden');
}

// Button event listeners to toggle between pages
document.getElementById('openPage2Button').addEventListener('click', () => {
    togglePages();
});

document.getElementById('openPage1Button').addEventListener('click', () => {
    togglePages();
});
