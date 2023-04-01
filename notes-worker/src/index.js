addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event.request));
});

const corsHeaders = {
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Origin': '*'
}

const getKVData = async () => {
	const notesData = [];
	const listResult = await NOTES.list();
	const keys = listResult.keys;
	for (const key of keys) {
		const value = await NOTES.get(key.name);
		notesData.push({ id: key.name, ...JSON.parse(value) })
	}
	return notesData;
};

const addNotes = async (key, value) => {
	await NOTES.put(key, JSON.stringify(value))
	const notesData = await getKVData();
	return new Response(JSON.stringify(notesData), {
		headers: {
			"Content-Type": "application/json",
			...corsHeaders
		},
	});
}

const deleteNotes = async (key) => {
	await NOTES.delete(key)
	const notesData = await getKVData();
	return new Response(JSON.stringify(notesData), {
		headers: {
			"Content-Type": "application/json",
			...corsHeaders
		},
	});
}

const editNotes = async (key, value) => {
	let data = await NOTES.get(key);
	if (data) {
		data = JSON.parse(data);
		data.title = value.title
		data.description = value.description
		await NOTES.put(key, JSON.stringify(data));
		const notesData = await getKVData();
		return new Response(JSON.stringify(notesData), {
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			},
		});
	} else {
		return new Response("Note not found", {
			headers: { "Content-Type": "text/plain" },
		});
	}
}


async function handleRequest(request) {
	console.log("--->", request.method)
	if (request.method === 'POST') {
		const { action } = await request.json();

		switch (action.type) {
			case 'ADD':
				return addNotes(action.key, action.value);
			case 'DELETE':
				return deleteNotes(action.key);
			case 'EDIT':
				return editNotes(action.key, action.value);
			default:
				return new Response("Invalid action", {
					headers: {
						"Content-Type": "text/plain",
						...corsHeaders
					},
				});
		}
		return new Response("Invalid action", {
			headers: {
				"Content-Type": "text/plain",
				...corsHeaders
			},
		});

	} else {
		const notesData = await getKVData();
		return new Response(JSON.stringify(notesData), {
			headers: {
				"Content-Type": "application/json",
				...corsHeaders
			},
		});

	}
}