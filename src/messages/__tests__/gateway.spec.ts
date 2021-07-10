// import { WebSocketGateway } from "@nestjs/websockets";
//
// describe("app", () => {
//   it("connect websockets response", (done) => {
//     expect.assertions(1);
//
//     const ws = new WebSocketGateway(`ws://localhost:1080`)
//       .on("message", (msg) => {
//         expect(JSON.parse(msg).id).toEqual(0);
//         ws.close();
//       })
//       .on("close", () => done());
//   });
// });
