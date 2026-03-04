import { computed } from "vue";
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
  // if (googleClientId) {
  //   onMounted(() => {
  //     const script = document.createElement("script");
  //     script.src = "https://accounts.google.com/gsi/client";
  //     script.async = true;
  //     script.defer = true;
  //     document.body.appendChild(script);

  //     script.onload = () => {
  //       requestAnimationFrame(() => {
  //         const gIdOnLoadElement = document.getElementById("g_id_onload");
  //         if (gIdOnLoadElement) gIdOnLoadElement.setAttribute("data-client_id", googleClientId);

  //         window.google.accounts.id.initialize({
  //           client_id: googleClientId,
  //           callback: async (response: any) => {
  //             try {
  //               await loginWithGoogle(response.credential);
  //               router.push("/");
  //             } catch {
  //               alert("Google login failed.");
  //             }
  //           },
  //         });

  //         window.google.accounts.id.renderButton(
  //           document.querySelector(".g_id_signin"),
  //           { theme: "outline", size: "large" }
  //         );
  //       });
  //     };
  //   });
  // }


  // const handleGoogleLogin = () => {
  //   if (!window.google) {
  //     console.error("Google SDK not loaded");
  //     return;
  //   }

  //   const client = window.google.accounts.oauth2.initTokenClient({
  //     client_id: googleClientId,
  //     scope: 'email profile',
  //     callback: async (response: { access_token: string; }) => {
  //       if (response.access_token) {
  //         await loginWithGoogle(response.access_token);
  //         router.push("/");
  //       }
  //     },
  //   });

  //   client.requestAccessToken();
  // };


  const googleLoginRedirect = () => {
    const clientId = googleClientId;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI);
    const scope = encodeURIComponent("email profile openid");
    const responseType = "id_token";
    const nonce = crypto.randomUUID(); 

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&nonce=${nonce}`;

    window.location.href = url; 
  };

  function isStudent(): boolean {
    if (!user.value?.groups) return false
    return user.value.groups.some((g: string) => {
      const group = g.toLowerCase()
      return (
        group === "students"
      )
    })
  }

  return { user, loading, error, login, loginWithGoogle, googleLoginRedirect, logout, isStudent }; //isAllowedToLogin, handleGoogleLogin
}
