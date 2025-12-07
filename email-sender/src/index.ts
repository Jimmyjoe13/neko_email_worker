import { EmailMessage } from "cloudflare:email";
import { d1_database } from "./d1_database";
import { auth_user, delete_user, find_user, insert_user, update_user, query_mail_meta, query_mail, delete_mail, recv_email, send_email } from "./handelers";
import { createMimeMessage } from "mimetext";
import { Buffer } from "node:buffer";

export interface Env{
	"tester@wcytest.xyz": SendEmail,
	"DB": D1Database,
	// vars
	SCRIPT_NAME: string,
	// secrets
	"ACCOUNT_ID": string,
	"API_TOKEN": string,
	// any
	[key: string]: any
}

interface resp_t {
	stat: number;
	token: string;
	data: string;
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		const path = new URL(request.url).pathname.split("/");
		const method = request.method;
		const database = new d1_database(env.DB);

		// Gestion du preflight CORS
		if (method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization",
					"Access-Control-Max-Age": "86400",
				}
			});
		}

		// Fonction helper pour ajouter les en-têtes CORS
		const addCorsHeaders = (response: Response): Response => {
			const newHeaders = new Headers(response.headers);
			newHeaders.set("Access-Control-Allow-Origin", "*");
			newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: newHeaders
			});
		};

		if (path[1] != "v1") {
			return addCorsHeaders(new Response("URL Error", { status: 500 }));
		}

		// users oper begin
		if (method == "GET" && path[2] == "users" && path.length == 4) {
			return addCorsHeaders(await find_user(request, env, ctx, database));
		}
		else if (method == "GET" && path[2] == "users" && path.length == 5 && path[4] == "password") {
			return addCorsHeaders(await auth_user(request, env, ctx, database));
		}
		else if (method == "POST" && path[2] == "users" && path.length == 5 && path[4] == "password") {
			return addCorsHeaders(await insert_user(request, env, ctx, database));
		}
		else if (method == "PUT" && path[2] == "users" && path.length == 5 && path[4] == "password") {
			return addCorsHeaders(await update_user(request, env, ctx, database));
		}
		else if (method == "DELETE" && path[2] == "users" && path.length == 5 && path[4] == "password") {
			return addCorsHeaders(await delete_user(request, env, ctx, database));
		}
		// users oper end
		// mail oper begin
		else if (method == "GET" && path[2] == "mail" && path.length == 3) {
			return addCorsHeaders(await query_mail_meta(request, env, ctx, database));
		}
		else if (method == "GET" && path[2] == "mail" && path.length == 4) {
			return addCorsHeaders(await query_mail(request, env, ctx, database));
		}
		else if (method == "DELETE" && path[2] == "mail" && path.length == 4) {
			return addCorsHeaders(await delete_mail(request, env, ctx, database));
		}
		else if (method == "POST" && path[2] == "mail" && path.length == 3) {
			return addCorsHeaders(await send_email(request, env, ctx, database));
		}
		// mail oper end
		else {
			return addCorsHeaders(new Response("URL Error", { status: 500 }));
		}
	},
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
		const database = new d1_database(env.DB);

		const to_user = message.to;

		const decoder = new TextDecoder('utf-8');
		let chunks: Uint8Array[] = [];
		for await (const chunk of message.raw) {
			chunks.push(chunk);
		}
		let data = "";
		for (const chunk of chunks) {
			data += decoder.decode(chunk);
		}

		const bs64_data = Buffer.from(data).toString('base64');

		await recv_email(to_user, bs64_data, database);
	}
};