# WebRTC Demo

A WebRTC Demo built with vanilla Javascript.

[![Netlify Status](https://api.netlify.com/api/v1/badges/9e4e4540-14bf-4ed7-8716-4e4e50fe784c/deploy-status)](https://app.netlify.com/sites/vanillajs-webrtc-demo/deploys)

## Installation

1. Navigate to the root directroy and use the node package manager ([npm](https://www.npmjs.com/)) to install the dependencies.

```bash
npm install
```

2. Fill in your metered credentials in the [sample config](./config.json.sample) file and rename it to `config.json`

## Usage

You will need STUN & TURN servers for the signaling process.
You can get those for free by signing up on [Metered](https://metered.ca) or hosting your own using [Coturn](https://github.com/coturn/coturn)

To run the app locally:

```bash
npm run dev
```

## Building for production

Generate production ready code using vite's build tool, the optimized files are stored in the /dist folder. These files can be deployed directly to a server.

```bash
npx vite build
```

## Additional Resources

- [Vite documentation](https://vitejs.com/docs/) - The official documentation for Vite
- [Guide](https://ourcodeworld.com/articles/read/1175/how-to-create-and-configure-your-own-stun-turn-server-with-coturn-in-ubuntu-18-04) for setting up Coturn
- [WebRTC Internals](chrome://webrtc-internals/) for debugging WebRTC errors

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
