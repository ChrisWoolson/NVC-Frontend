// src/app/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { getDatabase, ref, get, child, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
  }

  public async getData(path: string): Promise<any> {
    const dbRef = ref(this.db);
    try {
      const snapshot = await get(child(dbRef, path));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        console.log("No data available");
        return null;
      }
    } catch (error) {
      console.error("Error getting data: ", error);
      throw error;
    }
  }

// …
  public subscribeToData(path: string, callback: (val: any) => void): void {
    const dbRef = ref(this.db, path);
    onValue(dbRef, snap => {
      if (snap.exists()) { 
        callback(snap.val()); }
    }, err => console.error(err));
  }

}
