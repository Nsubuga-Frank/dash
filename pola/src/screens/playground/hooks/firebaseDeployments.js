import { collection, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase/config";

/**
 * Retrieves the tunnel URL for a deployed model from the Firebase deployments collection.
 *
 * @param {string} modelName - The name (or id) of the model (e.g. "gpt2").
 * @param {string} userId - The id of the current logged-in user.
 * @returns {Promise<string|null>} - The tunnel URL if found; otherwise, null.
 */
export async function getDeploymentTunnelUrl(modelName, userId) {
  const lowerModelName = modelName.toLowerCase();
  const lowerUserId = userId.toLowerCase();

  const deploymentsQuery = query(
    collection(db, "deployments"),
    where("model_id", "==", lowerModelName),
    where("user_id", "==", lowerUserId)
  );

  const querySnapshot = await getDocs(deploymentsQuery);
  if (!querySnapshot.empty) {
    // Assuming one deployment per (model, user) pair.
    const docData = querySnapshot.docs[0].data();
    return docData.tunnel_url;
  }
  return null;
}
