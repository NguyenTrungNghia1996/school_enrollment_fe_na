// composables/useRequest.js
import { useJwt } from "@vueuse/integrations/useJwt";

export class RequestUser {
  constructor() {
    const config = useRuntimeConfig();
    this.baseURL = config.public.baseURL;
  }

  isTokenValid(token) {
    const { payload } = useJwt(token);
    const exp = payload.value?.exp;
    const expTime = typeof exp === "string" ? Number(exp) : exp;

    return typeof expTime === "number" && Date.now() / 1000 < expTime;
  }

  // =========================
  // HANDLERS CHUNG
  // =========================
  handlers() {
    const userStore = useUserStore();
    const safeMessage = useSafeMessage();

    return {
      onRequest: ctx => {
        const token = userStore.token;

        if (!token) return;

        const isValid = this.isTokenValid(token);
        if (!isValid) {
          // safeMessage.info("Phiên đăng nhập đã hết hạn");
          userStore.logout();
          navigateTo("/");
          return;
        }

        const headers = new Headers(ctx.options.headers);
        headers.set("Authorization", `Bearer ${token}`);
        ctx.options.headers = headers;
      },

      onResponse(ctx) {
        return ctx.response._data;
      },

      async onResponseError(ctx) {
        if (ctx.response.status === 401) {
          // safeMessage.info("Phiên đăng nhập đã hết hạn");
          userStore.logout();
          await navigateTo("/");
        }

        return ctx.response._data;
      },
    };
  }

  // =========================
  // REQUEST GỐC
  // =========================
  request(url, options = {}) {
    return useFetch(url, {
      baseURL: this.baseURL,
      ...options,
      ...this.handlers(),
    });
  }

  fetch(url, options = {}) {
    return $fetch(url, {
      baseURL: this.baseURL,
      ...options,
      ...this.handlers(),
    });
  }

  async _mutate(url, options) {
    const data = ref(null);
    const error = ref(null);

    try {
      const res = await this.fetch(url, options);
      data.value = res;
    } catch (err) {
      error.value = {
        data: err.response?._data || err.data,
        message: err.message,
        ...err,
      };
    }

    return { data, error };
  }

  // =========================
  // METHODS
  // =========================
  get(url, options) {
    return this.request(url, {
      method: "GET",
      ...options,
    });
  }

  post(url, options) {
    return this._mutate(url, {
      method: "POST",
      ...options,
    });
  }

  put(url, options) {
    return this._mutate(url, {
      method: "PUT",
      ...options,
    });
  }

  patch(url, options) {
    return this._mutate(url, {
      method: "PATCH",
      ...options,
    });
  }

  delete(url, options) {
    return this._mutate(url, {
      method: "DELETE",
      ...options,
    });
  }
}
