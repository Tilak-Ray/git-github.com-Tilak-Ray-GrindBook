import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  increment,
  getDoc,
  setDoc,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Users
export const getOrCreateUserProfile = async (user: any) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    const newUser = {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous Grinder',
      photoURL: user.photoURL || '',
      stats: {
        level: 1,
        exp: 0,
        streak: 1,
        tasksCompleted: 0
      },
      createdAt: serverTimestamp()
    };
    await setDoc(userRef, newUser);
    
    // Developer Grant for Testing
    if (user.email === 'tilakraykurmi@gmail.com') {
      await updateDoc(userRef, {
        'inventory.steel': 150,
        'inventory.carbon': 150,
        'inventory.neon': 150,
        'stats.level': 25, // Boost level for testing capability locks
        'dev_grant_applied': true
      });
    }
    
    return newUser;
  }

  // Existing user developer check
  const data = userDoc.data();
  if (user.email === 'tilakraykurmi@gmail.com' && !data.dev_grant_applied) {
    await updateDoc(userRef, {
      'inventory.steel': 150,
      'inventory.carbon': 150,
      'inventory.neon': 150,
      'stats.level': 25,
      'dev_grant_applied': true
    });

    // Seed dummy tasks for developer testing
    const tasks = [
      { content: 'Initialize Neural Citadel', priority: 'critical', completed: false },
      { content: 'Synchronize Connectivity Matrix', priority: 'urgent', completed: false },
      { content: 'Verify Tactical ID Protocol', priority: 'standard', completed: false }
    ];
    
    for (const task of tasks) {
       await addDoc(collection(db, 'users', user.uid, 'tasks'), {
         ...task,
         createdAt: serverTimestamp()
       });
    }

    // Seed a developer post
    await addDoc(collection(db, 'posts'), {
      authorId: user.uid,
      authorName: user.displayName || 'Lead Architect',
      authorPhoto: user.photoURL || '',
      content: 'NEURAL_BASE_ESTABLISHED // ALL SYSTEMS GREEN. READY FOR ARCHITECTURAL EXPANSION.',
      likesCount: 99,
      commentsCount: 0,
      createdAt: serverTimestamp()
    });
  }

  return userDoc.data();
};

// Posts
export const createPost = async (userId: string, displayName: string, photoURL: string, content: string) => {
  return await addDoc(collection(db, 'posts'), {
    authorId: userId,
    authorName: displayName,
    authorPhoto: photoURL,
    content,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp()
  });
};

export const subscribeToPosts = (callback: (posts: any[]) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const likePost = async (postId: string) => {
  const postRef = doc(db, 'posts', postId);
  return await updateDoc(postRef, {
    likesCount: increment(1)
  });
};

// Tasks
export const addTask = async (userId: string, title: string, priority: 'standard' | 'urgent' | 'critical' = 'standard') => {
  return await addDoc(collection(db, 'users', userId, 'tasks'), {
    userId,
    title,
    priority,
    completed: false,
    createdAt: serverTimestamp()
  });
};

export const subscribeToTasks = (userId: string, callback: (tasks: any[]) => void) => {
  const q = query(collection(db, 'users', userId, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const toggleTask = async (userId: string, taskId: string, completed: boolean) => {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);
  await updateDoc(taskRef, { completed });

  if (completed && taskSnap.exists()) {
    const taskData = taskSnap.data();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const currentExp = data.stats.exp + 50;
      const currentLevel = data.stats.level;
      const nextLevelExp = currentLevel * 500;

      const blockType = taskData.priority === 'critical' ? 'carbon' : taskData.priority === 'urgent' ? 'neon' : 'steel';
      
      if (currentExp >= nextLevelExp) {
        await updateDoc(userRef, {
          'stats.exp': 0,
          'stats.level': increment(1),
          'stats.tasksCompleted': increment(1),
          [`inventory.${blockType}`]: increment(1)
        });
      } else {
        await updateDoc(userRef, {
          'stats.exp': increment(50),
          'stats.tasksCompleted': increment(1),
          [`inventory.${blockType}`]: increment(1)
        });
      }
    }
  }
};

export const updateBaseLayout = async (userId: string, layout: any[]) => {
  const userRef = doc(db, 'users', userId);
  return await updateDoc(userRef, {
    'outpost.layout': layout,
    'outpost.lastUpdated': serverTimestamp()
  });
};

export const deleteTaskFromDB = async (userId: string, taskId: string) => {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  return await deleteDoc(taskRef);
};

// Roadmaps
export const subscribeToUserRoadmaps = (userId: string, callback: (roadmaps: any[]) => void) => {
  const q = query(collection(db, 'users', userId, 'roadmaps'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const addRoadmapToUser = async (userId: string, roadmap: any) => {
  return await addDoc(collection(db, 'users', userId, 'roadmaps'), {
    ...roadmap,
    userId,
    createdAt: serverTimestamp()
  });
};

export const updateModuleStatus = async (userId: string, roadmapId: string, moduleIndex: number, status: 'completed' | 'current' | 'locked') => {
  const roadmapRef = doc(db, 'users', userId, 'roadmaps', roadmapId);
  const roadmapSnap = await getDoc(roadmapRef);
  if (roadmapSnap.exists()) {
    const modules = [...roadmapSnap.data().modules];
    modules[moduleIndex].status = status;
    
    // Calculate progress
    const completedCount = modules.filter(m => m.status === 'completed').length;
    const progress = Math.round((completedCount / modules.length) * 100);
    
    await updateDoc(roadmapRef, { modules, progress });
  }
};

// Profile update
export const updateUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  return await updateDoc(userRef, data);
};
