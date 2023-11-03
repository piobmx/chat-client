import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Button, Form, Input, Radio, Space, Switch, Table } from "antd";
import { getCompletionsFromOpenai } from "./OaiAPI";

const { Column } = Table;

const { TextArea } = Input;
const functionList = [
	"advise",
	"improve",
	"paraphrase",
	"grammar",
	"examples",
	"verify",
];

const defaultRadioButton = "paraphrase";
const WIDTH = window.innerWidth;
const appWidth = WIDTH > 768 ? "60%" : "98%";

function App() {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [latestMessage, setLatestMessage] = useState("");

	const [historyReplies, setHistoriesReplies] = useState([]);
	const [historyMessages, setHistoriesMessages] = useState([]);
	const [historyContexts, setHistoryContexts] = useState(
		"Here are some contexts, please also consider contexts when replying",
	);
	const [conversations, setConversations] = useState([]);
	const [contextChecked, setContextChecked] = useState(false);

	const [response, setResponse] = useState(null);
	const [radioValue, setRadioValue] = useState(defaultRadioButton);
	const [radioIndex, setRadioIndex] = useState(1);
	const textInputRef = useRef(null);
	const [textAreaFocus, setTextAreaFocus] = useState(false);

	function constructPrompt(message) {
		const task = radioValue;
		const taskedPrompt = promptsDict[task] + "\n\n" + message;
		return taskedPrompt;
	}

	const handleTextChange = (event) => {
		setLatestMessage(event.target.value);
	};

	const handleSubmit = async () => {
		//event.preventDefault();
		const message = latestMessage;
		const action = radioValue;
		let taskedMessage = constructPrompt(message);
		console.log("CONTEXT?", contextChecked);
		let finalMessage;
		if (contextChecked) {
			finalMessage = historyContexts + "\n" + taskedMessage;
			taskedMessage = "[Context]...\n" + taskedMessage;
		} else {
			finalMessage = taskedMessage;
		}
		// setHistoriesMessages([...historyMessages, taskedMessage]);
		//console.log(taskedMessage, radioValue);
		// const api = `http://84.46.248.181:5000/?text=${finalMessage}`;
		// console.log("API", api);
		//
		setLoading(true);



		getCompletionsFromOpenai(finalMessage, ()=>{})
			.then((newResponse) =>{
				setResponse(newResponse)
				setHistoriesReplies([...historyReplies, newResponse]);
				setHistoriesMessages([...historyMessages, taskedMessage]);
				let currentContext = historyContexts;
				currentContext += "\nUser:" + taskedMessage + "\n" +
					newResponse;

				const newConvo = {
					"Original": message,
					"User": taskedMessage,
					"Response": newResponse,
					"action": action,
				};
				// console.log(currentContext)
				setConversations([...conversations, newConvo]);
				setHistoryContexts(currentContext);
				form.resetFields();
			}).then(()=>{setLoading(false)})

		// fetch(api, { timeout: 5000 })
		// 	.then((response) => response.json())
		// 	.then((data) => {
		// 		const newResponse = data["response"];
		// 		setResponse(newResponse);
		// 		setLoading(false);
		// 		return [message, action, taskedMessage, newResponse];
		// 	})
		// 	.then((convo) => {
		// 		const [message, action, taskedMessage, newResponse] = convo;
		// 		setHistoriesReplies([...historyReplies, newResponse]);
		// 		setHistoriesMessages([...historyMessages, taskedMessage]);
		// 		let currentContext = historyContexts;
		// 		currentContext += "\nUser:" + taskedMessage + "\n" +
		// 			newResponse;

		// 		const newConvo = {
		// 			"Original": message,
		// 			"User": taskedMessage,
		// 			"Response": newResponse,
		// 			"action": action,
		// 		};
		// 		// console.log(currentContext)
		// 		setConversations([...conversations, newConvo]);
		// 		setHistoryContexts(currentContext);
		// 		form.resetFields();
		// 	});
	};

	const changeRadioValueWithKey = (event) => {
		//console.log(textInputRef.current.focus());
		console.log("textAreaFocus", textAreaFocus);
		// event.preventDefault()
		//if (textInputRef.current && !textInputRef.current.matches(":focus")) {
		//    return;
		//}
		if (event.shiftKey && event.metaKey && event.which === 37) {
			const currentIndex = radioIndex;
			let newIndex = currentIndex <= 0
				? functionList.length - 1
				: currentIndex - 1;
			setRadioIndex(newIndex);
			setRadioValue(functionList[newIndex]);
		} else if (event.shiftKey && event.metaKey && event.which === 39) {
			const currentIndex = radioIndex;
			let newIndex = currentIndex >= functionList.length - 1
				? 0
				: currentIndex + 1;
			setRadioIndex(newIndex);
			setRadioValue(functionList[newIndex]);
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", changeRadioValueWithKey);
		return () => {
			window.removeEventListener(
				"keydown",
				changeRadioValueWithKey,
				false,
			);
		};
	}, [radioIndex, radioValue]);

	const onRadioChange = (event) => {
		setRadioValue(event.target.value);
	};

	const onCheckboxChange = (checked) => {
		setContextChecked(checked);
	};

	function handleKeyDown(event) {
		// Enter
		//if (event.key === "Enter" && !event.shiftKey) {
		if (event.key === "Enter" && event.metaKey) {
			handleSubmit();
		} else {
			return;
		}
	}

	function clearConversations() {
		setConversations([]);
		setHistoriesReplies([]);
		setHistoriesMessages([]);
	}

	return (
		<div
			className="App"
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#eeffaa",
			}}
		>
			<h1>ChatGPT</h1>
			<RenderConversationsTable
				conversations={conversations}
			/>

			<Space
				direction="vertical"
				style={{ width: appWidth, justifyContent: "center" }}
			>
				<Form
					onFinish={handleSubmit}
					form={form}
				>
					<Form.Item>
						<Radio.Group
							buttonStyle="solid"
							defaultValue={radioValue}
							value={radioValue}
							onChange={onRadioChange}
						>
							<Radio.Button value="advise">
								Advise
							</Radio.Button>
							<Radio.Button value="improve">
								Improve
							</Radio.Button>
							<Radio.Button value="paraphrase">
								Paraphrase
							</Radio.Button>
							<Radio.Button value="grammar">Grammar</Radio.Button>
							<Radio.Button value="examples">
								Similar Examples
							</Radio.Button>
							<Radio.Button value="verify">Verify</Radio.Button>
						</Radio.Group>
					</Form.Item>
					<Form.Item
						name="message"
						rules={[
							{
								required: true,
								message: "Please input your message!",
							},
						]}
						style={{
							maxWidth: "100%",
							background: "transparent",
						}}
					>
						<TextArea
							className="maintextarea"
							showCount
							ref={textInputRef}
							onFocus={() => {
								console.log("focus");
								setTextAreaFocus(true);
							}}
							onBlur={() => {
								console.log("blur");
								setTextAreaFocus(false);
							}}
							onKeyDown={handleKeyDown}
							allowClear
							onChange={handleTextChange}
							placeholder="Your message"
							//size="large"
							autoSize={{ minRows: 2, maxRows: 10 }}
							autoFocus
							style={{
								background: "transparent",
								fontSize: 18,
								color: "#991",
								textAlign: "right",
								//border: "none",
								overflow: "none",
								outline: "none",
							}}
						/>
					</Form.Item>

					<Form.Item
						name="Use Context"
						// valuePropName="checked"
						wrapperCol={{
							offset: 0,
							span: 0,
						}}
					>
						<Switch
							onClick={onCheckboxChange}
							checkedChildren={"Use Context"}
							unCheckedChildren={"No Context"}
							checked={contextChecked}
							size="large"
						/>
					</Form.Item>

					<Form.Item wrapperCol={{ offset: 0, span: 0 }}>
						<Button
							type="primary"
							htmlType="submit"
							loading={loading}
							style={{ marginRight: "8px" }}
						>
							Submit
						</Button>
						<Button
							danger
							onClick={clearConversations}
							type="default"
						>
							Delete History
						</Button>
					</Form.Item>
				</Form>
			</Space>
		</div>
	);
}

function renderConversationsToObjects(conversations) {
	let pindex = 0;
	// historyReplies, historyMessages
	let conversationsData = [];
	for (const c of conversations) {
		let convoRow = { key: pindex };
		const userMsg = c["User"];
		let chatMsg = c["Response"];
		chatMsg = chatMsg.replace("ChatGPT Reply: ", "");
		convoRow["ChatGPT"] = chatMsg;
		convoRow["User"] = userMsg;
		convoRow["index"] = pindex;
		conversationsData.push(convoRow);
		pindex += 1;
	}
	return conversationsData;
}

function RenderConversationsTable(props) {
	const { conversations } = props;
	const conversationsData = renderConversationsToObjects(
		conversations,
	);
	//console.log(conversationsData);
	return (
		<Table
			dataSource={conversationsData}
			pagination={false}
			style={{
				width: appWidth,
				whiteSpace: "pre-line",
				margin: "0px 0 30px 0",
				fontWeight: "500",
			}}
			border={false}
		>
			<Column title="User" dataIndex="User" key="User" width="40%" />
			<Column title="ChatGPT" dataIndex="ChatGPT" key="ChatGPT" />
		</Table>
	);
}

const promptsDict = {
	"advise": "Can you tell me about this: ",
	"grammar": "Is this sentence grammarly correct: ",
	"verify":
		`Answer the question as truthfully as possible, and if you're unsure of the answer, say "Sorry, I don't know"`,
	"improve": `Please help me improve this piece of sentence: `,
	"paraphrase":
		`Please help me paraphrase or restructure this sentence so that it sounds more professional: `,
	"examples": `Please give me some alternatives for this word or sentence: `,
};

export default App;
