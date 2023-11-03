import OpenAI from "openai"
import getPromptObject from "./PromptObjectGenerator";


export async function getCompletionsFromOpenai(userPrompt, callback) {
	const apiKey =
		localStorage.getItem("api-key") === null
			? process.env.OAI_KEY
			: localStorage.getItem("api-key");

	const model =
		localStorage.getItem("model") === null
			? "gpt-4"
			// ? "gpt-3.5-turbo"
			: localStorage.getItem("model");
	const openai = new OpenAI({
		apiKey: apiKey,
		dangerouslyAllowBrowser: true,
	});
	const promptObject = getPromptObject(userPrompt);
	try {
		const stream = await openai.chat.completions.create({
			model: model,
			messages: promptObject,
			stream: true,
			temperature: 0.7,
		});
		let result = "";
		for await (const part of stream) {
			let token = part.choices[0].delta;
			let content = token?.content;
			if (token?.content !== undefined) {
				result += content;
				// callback(result);
			}
		}

		return result;
	} catch (error) {
		if (error instanceof OpenAI.APIError) {
			console.error(error.status);
			console.error(error.message);
			console.error(error.code);
			console.error(error.type);
		} else {
			console.log(error);
		}
	}
}
