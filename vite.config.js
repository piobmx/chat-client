import { defineConfig, loadEnv } from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
	const env = loadEnv("mock", process.cwd(), "");
	const processEnvValues = {
		"process.env": Object.entries(env).reduce((prev, [key, val]) => {
			// console.log(key, val);
			return {
				...prev,
				[key]: val,
			};
		}, {}),
	};

	return {
		plugins: [react()],
		server: {
			port: 8088,
			host: "0.0.0.0"
		},
		define: processEnvValues,
	};
});

