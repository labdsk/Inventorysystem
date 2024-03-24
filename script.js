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
  const inventoryRef = database.ref('inventory');
  
  const inventoryForm = document.getElementById('inventoryForm');
  const inventoryList = document.querySelector('#inventoryList tbody');
  
  inventoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const itemName = document.getElementById('itemName').value;
      const quantity = parseInt(document.getElementById('quantity').value);
      const note = document.getElementById('note').value; // Get note as a string
  
      if (itemName && quantity) {
          inventoryRef.push({
              itemName: itemName,
              quantity: quantity,
              note: note,
          });
          inventoryForm.reset();
      }
  });
  
  inventoryRef.on('value', (snapshot) => {
      inventoryList.innerHTML = '';
      snapshot.forEach((childSnapshot) => {
          const item = childSnapshot.val();
          const itemKey = childSnapshot.key;
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${item.itemName}</td>
              <td>${item.quantity}</td>
              <td>${item.note}</td> <!-- Display note column data -->
              <td>${item.test}</td>
              <td><button class="delete-button" data-item-key="${itemKey}">Delete</button></td>`;
          inventoryList.appendChild(row);
      });
      // Add event listener to delete buttons
      const deleteButtons = document.querySelectorAll('.delete-button');
      deleteButtons.forEach(button => {
          button.addEventListener('click', (e) => {
              const itemKey = e.target.getAttribute('data-item-key');
              if (itemKey) {
                  inventoryRef.child(itemKey).remove();
              }
          });
      });
  });

  inventoryRef.on('value', (snapshot) => {
    inventoryList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const item = childSnapshot.val();
        const itemKey = childSnapshot.key;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="editable" data-item-key="${itemKey}" data-field="itemName">${item.itemName}</td>
            <td class="editable" data-item-key="${itemKey}" data-field="quantity">${item.quantity}</td>
            <td class="editable" data-item-key="${itemKey}" data-field="note">${item.note}</td>
            <td class="editable" data-item-key="${itemKey}" data-field="test">${item.test ? item.test : 'Type here'}</td>
            <td>
                <button class="delete-button" data-item-key="${itemKey}">Delete</button>
            </td>`;
        inventoryList.appendChild(row);
    });

    // Add event listener to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const itemKey = e.target.getAttribute('data-item-key');
            if (itemKey) {
                inventoryRef.child(itemKey).remove();
            }
        });
    });
    // event for edit text
    const editableCells = document.querySelectorAll('.editable');
    editableCells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            const input = document.createElement('input');
            const defaultValue = e.target.innerText === 'Type here' ? '' : e.target.innerText;
            input.value = defaultValue;
            e.target.innerText = ''; // Clear the default text here
            e.target.appendChild(input);
            input.focus();
            input.addEventListener('blur', () => {
                const newValue = input.value;
                const itemKey = e.target.getAttribute('data-item-key');
                const field = e.target.getAttribute('data-field');
                inventoryRef.child(itemKey).update({
                    [field]: newValue
                });
                e.target.innerText = newValue || 'Type here';
            });
        });
    });
});