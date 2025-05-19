import type { User } from "@/models";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";

export const useAuth = () => {
    const { user, login, logout } = useContext(AppContext) as {
        user: User | null;
        login: (user: User) => void;
        logout: () => void;
    };

    return { user, login, logout };
}
