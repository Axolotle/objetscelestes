

const storage = {
    db: null,
    osName: 'skyMap_os',

    save(data) {
        // open a read/write db transaction, ready for adding the data
        let transaction = this.db.transaction([this.osName], 'readwrite');

        // call an object store that's already been added to the database
        let objectStore = transaction.objectStore(this.osName);

        for (const elem of data) {
            let request = objectStore.put(elem);
            request.onsuccess = function(e) {
                console.log('sucess: data added to objectStore');
            };
        }

        // Report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function() {
            console.log('Transaction completed: database modification finished.');

            // // update the display of data to show the newly added item, by running displayData() again.
            // displayData();
        };

        transaction.onerror = function() {
            console.log('error: Transaction not opened');
        };
    },

    getData() {
        return new Promise((resolve, reject) => {
            // Open our object store and then get a cursor - which iterates through all the
            // different data items in the store
            const os = this.db.transaction(this.osName).objectStore(this.osName);
            const data = []

            os.openCursor().onsuccess = function(e) {
                // Get a reference to the cursor
                const cursor = e.target.result;

                // If there is still another data item to iterate through, keep running this code
                if (cursor) {
                    data.push(cursor.value);
                    console.log('cursor', cursor.value);

                    // Iterate to the next item in the cursor
                    cursor.continue();
                } else {
                    if (data.length) {
                        console.log('returning data');
                        resolve(data);
                    } else {
                        console.log('no data in objectStore');
                        resolve(null);
                    }
                }
            };
        });
    }
}

export function initDB() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('skyMaps_bd', 1);

        request.onerror = function() {
            console.log('error: Database failed to open');
            reject();
        };

        request.onsuccess = function() {
            console.log('sucess: Database opened');
            storage.db = request.result;
            resolve(storage);
        };

        // Setup the database tables if this has not already been done
        request.onupgradeneeded = function(e) {
            const db = e.target.result;

            // Create an objectStore to store data including a auto-incrementing key
            const objectStore = db.createObjectStore('skyMap_os', {
                keyPath: 'id', autoIncrement:true
            });

            const indexes = [
                { name: 'name', options: { unique: false } },
                { name: 'type', options: { unique: false } },
                { name: 'asterisms', options: { unique: false } },
            ];

            // Define what data items the objectStore will contain
            for (const index of indexes) {
                objectStore.createIndex(index.name, index.name, index.options);
            }

            console.log('Database setup complete');
        };
    });
}


// Define the deleteItem() function
function deleteItem(e) {
  // retrieve the name of the task we want to delete. We need
  // to convert it to a number before trying it use it with IDB; IDB key
  // values are type-sensitive.
  let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));

  // open a database transaction and delete the task, finding it using the id we retrieved above
  let transaction = db.transaction(['notes_os'], 'readwrite');
  let objectStore = transaction.objectStore('notes_os');
  let request = objectStore.delete(noteId);

  // report that the data item has been deleted
  transaction.oncomplete = function() {
    // delete the parent of the button
    // which is the list item, so it is no longer displayed
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    console.log('Note ' + noteId + ' deleted.');

    // Again, if list item is empty, display a 'No notes stored' message
    if(!list.firstChild) {
      let listItem = document.createElement('li');
      listItem.textContent = 'No notes stored.';
      list.appendChild(listItem);
    }
  };
}
