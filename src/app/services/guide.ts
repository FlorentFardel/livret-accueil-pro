import { Injectable, inject, signal, NgZone } from '@angular/core';
import { Firestore, doc, onSnapshot, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Category, HomeConfig, SubCategory, SubSubCategory } from '../models/guide';

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private zone = inject(NgZone);

  readonly categories = signal<Category[]>([]);
  readonly homeConfig = signal<HomeConfig>({
    houseName: 'Bienvenue',
    introText: 'Chargement en cours...',
    wifiNetwork: '',
    wifiPassword: ''
  });

  constructor() {
    this.initFirebaseSync();
  }

  private initFirebaseSync(): void {
    const homeDocRef = doc(this.firestore, 'app_data', 'home_config');
    onSnapshot(homeDocRef, (snapshot) => {
      if (snapshot.exists()) {
        this.zone.run(() => this.homeConfig.set(snapshot.data() as HomeConfig));
      }
    });

    const categoriesDocRef = doc(this.firestore, 'app_data', 'categories_data');
    onSnapshot(categoriesDocRef, { includeMetadataChanges: true }, (snapshot) => {
      if (snapshot.exists() && snapshot.data()['list'] && !snapshot.metadata.hasPendingWrites) {
        this.zone.run(() => this.categories.set(snapshot.data()['list'] as Category[]));
      }
    });
  }

  private async syncToFirestore(cats: Category[]): Promise<void> {
    this.categories.set([...cats]);
    try {
      const docRef = doc(this.firestore, 'app_data', 'categories_data');
      await setDoc(docRef, { list: cats });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde Firestore :', error);
    }
  }

  async uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${folder}/${Date.now()}_${cleanFileName}`;
    const storageRef = ref(this.storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  async updateHomeConfig(config: HomeConfig): Promise<void> {
    this.homeConfig.set(config);
    const docRef = doc(this.firestore, 'app_data', 'home_config');
    await setDoc(docRef, config);
  }

  // --- CRUD NIVEAU 1 : CATÉGORIES ---

  addCategory(name: string, icon: string): void {
    const newCat: Category = { id: 'cat-' + Date.now(), name, icon: icon || 'folder', subCategories: [] };
    this.syncToFirestore([...this.categories(), newCat]);
  }

  updateCategory(categoryId: string, name: string, icon: string): void {
    const updated = this.categories().map(cat => cat.id === categoryId ? { ...cat, name, icon } : cat);
    this.syncToFirestore(updated);
  }

  deleteCategory(categoryId: string): void {
    this.syncToFirestore(this.categories().filter(cat => cat.id !== categoryId));
  }

  // --- CRUD NIVEAU 2 : SOUS-CATÉGORIES ---

  addSubCategory(categoryId: string, item: Omit<SubCategory, 'id'>): void {
    const newItem: SubCategory = { ...item, id: 'sub-' + Date.now() };
    const updated = this.categories().map(cat => 
      cat.id === categoryId ? { ...cat, subCategories: [...(cat.subCategories || []), newItem] } : cat
    );
    this.syncToFirestore(updated);
  }

  updateSubCategory(categoryId: string, updatedItem: SubCategory): void {
    const updated = this.categories().map(cat => 
      cat.id === categoryId ? { ...cat, subCategories: (cat.subCategories || []).map(sub => sub.id === updatedItem.id ? updatedItem : sub) } : cat
    );
    this.syncToFirestore(updated);
  }

  deleteSubCategory(categoryId: string, subCategoryId: string): void {
    const updated = this.categories().map(cat => 
      cat.id === categoryId ? { ...cat, subCategories: (cat.subCategories || []).filter(sub => sub.id !== subCategoryId) } : cat
    );
    this.syncToFirestore(updated);
  }

  // --- CRUD NIVEAU 3 : SOUS-SOUS-CATÉGORIES ---

  addSubSubCategory(categoryId: string, subId: string, item: Omit<SubSubCategory, 'id'>): void {
    const newItem: SubSubCategory = { ...item, id: 'subsub-' + Date.now() };
    const updated = this.categories().map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subCategories: (cat.subCategories || []).map(sub => {
          if (sub.id !== subId) return sub;
          return { ...sub, subSubCategories: [...(sub.subSubCategories || []), newItem] };
        })
      };
    });
    this.syncToFirestore(updated);
  }

  updateSubSubCategory(categoryId: string, subId: string, updatedItem: SubSubCategory): void {
    const updated = this.categories().map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subCategories: (cat.subCategories || []).map(sub => {
          if (sub.id !== subId) return sub;
          return { ...sub, subSubCategories: (sub.subSubCategories || []).map(ss => ss.id === updatedItem.id ? updatedItem : ss) };
        })
      };
    });
    this.syncToFirestore(updated);
  }

  deleteSubSubCategory(categoryId: string, subId: string, subSubId: string): void {
    const updated = this.categories().map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        subCategories: (cat.subCategories || []).map(sub => {
          if (sub.id !== subId) return sub;
          return { ...sub, subSubCategories: (sub.subSubCategories || []).filter(ss => ss.id !== subSubId) };
        })
      };
    });
    this.syncToFirestore(updated);
  }
}