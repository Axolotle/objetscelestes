

const storage = {
    db: null,
    osName: 'skyMap_os',

    openTransaction(mode) {
        // open a read/write db transaction, ready for adding the data
        const transaction = this.db.transaction(this.osName, mode);
        // call an object store that's already been added to the database
        const store = transaction.objectStore(this.osName);

        return [store, transaction];
    },

    save(data) {
        const [store, transaction] = this.openTransaction('readwrite');

        const request = store.put(data);
        request.onsuccess = function(e) {
            console.log('sucess: data added to objectStore');
        };

        // Report on the success of the transaction completing, when everything is done
        transaction.oncomplete = function() {
            console.log('Transaction completed: database modification finished.');
        };

        transaction.onerror = function() {
            console.log('error: Transaction not opened');
        };
    },

    get(item) {
        return new Promise((resolve, reject) => {
            const [store, transaction] = this.openTransaction('readonly');
            let request = item !== undefined ? store.get(item): store.getAll();
            request.onsuccess = (e) => resolve(e.target.result);
        });
    },

    deleteItem(id) {
        const [store, transaction] = this.openTransaction('readwrite');
        const request = store.delete(id);

        // transaction.oncomplete = function() {};
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
        request.onupgradeneeded = function(upgradeDB) {
            const db = upgradeDB.target.result;
            switch (upgradeDB.oldVersion) {
                case 0:
                    // Create an objectStore to store data including a auto-incrementing key
                    const store = db.createObjectStore('skyMap_os', { keyPath: 'id' });
                    // Define what data items the objectStore will contain
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('group', 'group', { unique: false });
                    store.createIndex('asterisms', 'asterisms', { unique: false });
            }
            console.log('Database setup complete');
        };
    });
}
