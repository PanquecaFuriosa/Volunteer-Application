import { useContext } from "react"
import { AlertContext } from "../context/AlertProvider"

export const useGlobalAlert = () => {
    return useContext(AlertContext);
}