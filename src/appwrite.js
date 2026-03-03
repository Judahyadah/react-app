import { Client, Databases, Query, ID } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    // use appwrite sdk checks if searchterm exists in the database if it does the it updates it, if it doesn't it creates a new record with searchterm and count 1
    try {
      const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [Query.equal('searchTerm', searchTerm)]);
        if(result.documents.length > 0) {
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, TABLE_ID, doc.$id, {
                count: doc.count + 1,
            })
        } else {
            await database.createDocument(DATABASE_ID, TABLE_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`, 
            })
        }
    }
    catch (error) {
        console.error(`Error updating search count ${error}`);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.limit(5), 
            Query.orderDesc('count')
        ]);
        return result.documents;
    } catch (error) {
        console.error(`Error fetching trending movies ${error}`);
        throw error;
    }
}