export default function getPromptObject(user_prompt, mode) {
	if (mode === "test") {
		return [
			{
				role: "system",
				content: "you are a waiter at a french restaurant",
			},
			{ role: "user", content: `what's the special tonight?` },
		];
	} else if (mode === "inspiration") {
		return [
			{ role: "system", content: alterSystemPrompt },
			{
				role: "user",
				content: `${user_prompt}`,
			},
		];
	} else {
		return [
			{ role: "system", content: defaultSystemPrompt },
			{ role: "user", content: `${user_prompt}` },
		];
	}
}

const alterSystemPrompt = `
`;

const defaultSystemPrompt = `
`;

