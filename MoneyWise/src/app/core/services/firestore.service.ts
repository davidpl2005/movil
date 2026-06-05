import { Injectable } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';

// Inicializa Firebase solo una vez
const firebaseApp = getApps().length === 0
  ? initializeApp(environment.firebase)
  : getApps()[0];

const db = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class FirestoreService {

  // Obtiene un documento por colección e id
  async get(coleccion: string, id: string): Promise<any> {
    const snap = await getDoc(doc(db, coleccion, id));
    return snap.exists() ? snap.data() : null;
  }

  // Guarda o reemplaza un documento
  async set(coleccion: string, id: string, data: any): Promise<void> {
    await setDoc(doc(db, coleccion, id), data);
  }

  // Elimina un documento
  async delete(coleccion: string, id: string): Promise<void> {
    await deleteDoc(doc(db, coleccion, id));
  }

  // Trae todos los documentos de una colección
  async getAll(coleccion: string): Promise<any[]> {
    const snap = await getDocs(collection(db, coleccion));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Busca documentos donde campo === valor
  async query(coleccion: string, campo: string, valor: any): Promise<any[]> {
    const q = query(collection(db, coleccion), where(campo, '==', valor));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}