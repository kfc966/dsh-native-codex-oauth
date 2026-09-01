import { randomUUID } from "node:crypto";
import { parseCredentialKey } from "@deepseek-ai/dsh-credentials";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/index.js
/** Optional Remote controller for pi-ai provider authorization flows. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Host owner of the optional `piAiOAuth` Remote namespace. */
let PiAiOAuthController = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _describe_decorators;
	let _begin_decorators;
	let _answer_decorators;
	let _cancel_decorators;
	let _signOut_decorators;
	let _follow_decorators;
	return class PiAiOAuthController extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_describe_decorators = [Remote];
			_begin_decorators = [Remote];
			_answer_decorators = [Remote];
			_cancel_decorators = [Remote];
			_signOut_decorators = [Remote];
			_follow_decorators = [Remote({ mode: "stream" })];
			__esDecorate(this, null, _describe_decorators, {
				kind: "method",
				name: "describe",
				static: false,
				private: false,
				access: {
					has: (obj) => "describe" in obj,
					get: (obj) => obj.describe
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _begin_decorators, {
				kind: "method",
				name: "begin",
				static: false,
				private: false,
				access: {
					has: (obj) => "begin" in obj,
					get: (obj) => obj.begin
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _answer_decorators, {
				kind: "method",
				name: "answer",
				static: false,
				private: false,
				access: {
					has: (obj) => "answer" in obj,
					get: (obj) => obj.answer
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _cancel_decorators, {
				kind: "method",
				name: "cancel",
				static: false,
				private: false,
				access: {
					has: (obj) => "cancel" in obj,
					get: (obj) => obj.cancel
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _signOut_decorators, {
				kind: "method",
				name: "signOut",
				static: false,
				private: false,
				access: {
					has: (obj) => "signOut" in obj,
					get: (obj) => obj.signOut
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _follow_decorators, {
				kind: "method",
				name: "follow",
				static: false,
				private: false,
				access: {
					has: (obj) => "follow" in obj,
					get: (obj) => obj.follow
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["authorization", "credentials"];
		interactions = (__runInitializers(this, _instanceExtraInitializers), /* @__PURE__ */ new Map());
		prompts = /* @__PURE__ */ new Map();
		versions = /* @__PURE__ */ new Map();
		waiters = /* @__PURE__ */ new Map();
		/** @param ctx - Host context carrying authorization and credential seams. */
		constructor(ctx) {
			super(ctx, "piAiOAuth", { namespace: "piAiOAuth" });
			ctx.on("credentials/record-updated", (key) => {
				this.publish(key);
			});
			ctx.on("authorization/settled", (key) => {
				this.publish(key);
			});
		}
		/**
		* Describe one registered flow and its value-free stored-record state.
		* @param rawKey - `<scope>/<id>` credential key.
		* @returns the live view, or undefined when no flow claims the key.
		*/
		async describe(rawKey) {
			const key = this.key(rawKey);
			const flow = this.ctx.authorization.describe(key);
			if (flow === void 0) return void 0;
			const interaction = this.interactions.get(key);
			return {
				key,
				label: flow.label,
				methods: flow.methods,
				inFlight: flow.inFlight,
				credential: await this.ctx.credentials.describeRecord(key),
				...interaction === void 0 ? {} : { interaction }
			};
		}
		/**
		* Run one authorization attempt.
		* @param rawKey - flow credential key.
		* @param method - flow-owned method id.
		* @param signal - caller cancellation.
		* @returns authorized or cancelled outcome.
		*/
		async begin(rawKey, method, signal) {
			const key = this.key(rawKey);
			const interaction = {
				notify: (notice) => {
					this.interactions.set(key, {
						...this.interactions.get(key),
						notice
					});
					this.publish(key);
				},
				prompt: (prompt) => this.ask(key, prompt)
			};
			try {
				return await this.ctx.authorization.begin({
					key,
					method,
					interaction,
					signal
				});
			} catch (error) {
				throw new RemoteError("gateway/internal", error instanceof Error ? error.message : String(error), {}, { cause: error });
			} finally {
				this.rejectPrompt(key, /* @__PURE__ */ new Error("authorization attempt ended"));
				this.interactions.delete(key);
				this.publish(key);
			}
		}
		/**
		* Answer the exact prompt currently waiting for this key.
		* @param rawKey - flow credential key.
		* @param rawPromptId - opaque prompt identity returned by `follow`.
		* @param value - text or selected option id.
		*/
		answer(rawKey, rawPromptId, value) {
			const key = this.key(rawKey);
			const pending = this.prompts.get(key);
			if (pending === void 0 || pending.id !== rawPromptId) throw new RemoteError("gateway/bad-request", "authorization prompt is absent or stale", {});
			this.prompts.delete(key);
			this.interactions.set(key, withoutPrompt(this.interactions.get(key)));
			pending.cleanup();
			pending.resolve(value);
			this.publish(key);
		}
		/**
		* Cancel an attempt from any browser observing its key.
		* @param rawKey - flow credential key.
		*/
		cancel(rawKey) {
			this.ctx.authorization.cancel(this.key(rawKey));
		}
		/**
		* Forget one stored authorization grant locally.
		* @param rawKey - flow credential key.
		*/
		async signOut(rawKey) {
			await this.ctx.credentials.deleteRecord(this.key(rawKey));
		}
		/**
		* Stream a complete baseline and every later interaction or credential change.
		* @param rawKey - flow credential key.
		* @param signal - stream lifetime.
		* @returns current value-free authorization view after each change.
		*/
		async *follow(rawKey, signal) {
			const key = this.key(rawKey);
			let seen = -1;
			while (true) {
				if (signal.aborted) return;
				if ((this.versions.get(key) ?? 0) === seen) {
					await this.changed(key, signal);
					continue;
				}
				seen = this.versions.get(key) ?? 0;
				yield await this.describe(key);
			}
		}
		/** Hold one browser-answerable prompt until an exact answer or withdrawal. */
		ask(key, prompt) {
			if (this.prompts.has(key)) return Promise.reject(/* @__PURE__ */ new Error(`authorization flow for "${key}" requested concurrent prompts`));
			const id = randomUUID();
			const projected = "options" in prompt ? {
				kind: prompt.kind,
				message: prompt.message,
				options: prompt.options.map((option) => ({ ...option }))
			} : {
				kind: prompt.kind,
				message: prompt.message,
				...prompt.placeholder === void 0 ? {} : { placeholder: prompt.placeholder }
			};
			const settled = Promise.withResolvers();
			const withdrawn = () => {
				this.prompts.delete(key);
				this.interactions.set(key, withoutPrompt(this.interactions.get(key)));
				settled.reject(prompt.signal?.reason);
				this.publish(key);
			};
			prompt.signal?.addEventListener("abort", withdrawn, { once: true });
			const cleanup = () => {
				prompt.signal?.removeEventListener("abort", withdrawn);
			};
			this.prompts.set(key, {
				id,
				resolve: settled.resolve,
				reject: settled.reject,
				cleanup
			});
			this.interactions.set(key, {
				...this.interactions.get(key),
				prompt: {
					id,
					prompt: projected
				}
			});
			this.publish(key);
			return settled.promise.finally(cleanup);
		}
		/** Reject and remove one pending prompt, when present. */
		rejectPrompt(key, reason) {
			const pending = this.prompts.get(key);
			if (pending === void 0) return;
			this.prompts.delete(key);
			pending.cleanup();
			pending.reject(reason);
		}
		/** Advance one key's revision and wake every stream waiting on it. */
		publish(key) {
			this.versions.set(key, (this.versions.get(key) ?? 0) + 1);
			const waiters = this.waiters.get(key);
			this.waiters.delete(key);
			for (const wake of waiters ?? []) wake();
		}
		/** Wait until a key changes, without missing a change racing registration. */
		changed(key, signal) {
			return new Promise((resolve) => {
				const waiters = this.waiters.get(key) ?? /* @__PURE__ */ new Set();
				const finish = () => {
					signal.removeEventListener("abort", finish);
					waiters.delete(finish);
					if (waiters.size === 0) this.waiters.delete(key);
					resolve();
				};
				waiters.add(finish);
				this.waiters.set(key, waiters);
				signal.addEventListener("abort", finish, { once: true });
			});
		}
		/** Validate and brand one untrusted wire key. */
		key(rawKey) {
			try {
				return parseCredentialKey(rawKey);
			} catch (error) {
				throw new RemoteError("gateway/bad-request", "invalid pi-ai OAuth credential key", {}, { cause: error });
			}
		}
	};
})();
/** Remove the optional prompt without materializing an explicit undefined member. */
function withoutPrompt(interaction) {
	if (interaction?.notice === void 0) return {};
	return { notice: interaction.notice };
}
//#endregion
export { PiAiOAuthController, PiAiOAuthController as default };
