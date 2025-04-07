import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import db from "../../firebase/config";

export function useDeploymentStatus(modelId, userId) {
  const [deploymentStatus, setDeploymentStatus] = useState("deploy");

  useEffect(() => {
    if (!modelId || !userId) {
      console.log("[useDeploymentStatus] Missing modelId or userId. Status remains 'deploy'.");
      return;
    }

    const lowerModelId = modelId.toLowerCase();
    const lowerUserId = userId.toLowerCase();

    console.log(
      `[useDeploymentStatus] Listening for deployments where model_id='${lowerModelId}' and user_id='${lowerUserId}'...`
    );

    const q = query(
      collection(db, "deployments"),
      where("model_id", "==", lowerModelId),
      where("user_id", "==", lowerUserId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          console.log(
            `[useDeploymentStatus] Found at least one matching doc for user_id='${lowerUserId}' and model_id='${lowerModelId}'. Setting status to 'completed'.`
          );
          setDeploymentStatus("completed");
        } else {
          console.log(
            `[useDeploymentStatus] No matching docs found. Setting status to 'deploy'.`
          );
          setDeploymentStatus("deploy");
        }
      },
      (error) => {
        console.error("[useDeploymentStatus] Firestore snapshot error:", error);
      }
    );

    return () => {
      console.log("[useDeploymentStatus] Unsubscribing from Firestore listener.");
      unsubscribe();
    };
  }, [modelId, userId]);

  return deploymentStatus;
}
