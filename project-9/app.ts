const text = "This is only a test!";
const encoder = new TextEncoder();
const data = encoder.encode(text);

Deno.writeFile("message_deno.txt", data).then(() =>
  console.log("Wrote to message.txt!")
);
