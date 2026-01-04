import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";

declare global {
  interface Window {
    google?: any;
  }
}

export function useAuth(googleClientId?: string) {
  const store = useAuthStore();
  const router = useRouter();

  const user = computed(() => store.user);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);

  const login = async (username: string, password: string) => {
    await store.login(username, password);
  };

  const loginWithGoogle = async (token: string) => {
    await store.loginWithGoogle(token);
  };

  const logout = () => {
    store.logout();
    router.push("/auth/login");
  };

  // Google login SDK
  if (googleClientId) {
    onMounted(() => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        const gIdOnLoadElement = document.getElementById("g_id_onload");
        if (gIdOnLoadElement) gIdOnLoadElement.setAttribute("data-client_id", googleClientId);

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            try {
              await loginWithGoogle(response.credential);
              router.push("/");
            } catch {
              alert("Google login failed.");
            }
          },
        });

        window.google.accounts.id.renderButton(
          document.querySelector(".g_id_signin"),
          { theme: "outline", size: "large" }
        );
      };
    });
  }

  return { user, loading, error, login, loginWithGoogle, logout };
}
