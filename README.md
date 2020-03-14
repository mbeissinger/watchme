# Watch Me

A helpful webapp that helps you develop better habits. It watches you through your webcam, and sends image frames at the specified interval to the web service of your choice. If that call returns the specified label, a sounds is played.

## Setup

1. Clone this repo
2. `yarn start`
3. In your browser, allow autoplay for `localhost` (in Safari this is under `Preferences/Websites/Auto-Play`)
4. Aim your browser at `http:localhost:8888`
5. Enter in the URL of your web service (must return a JSON object of the form `{ "outputs": { "Prediction": LABEL } }`)
6. Enter the label that should play the sound
7. Enter in a polling interval in milliseconds (currently no less than 100)

## Credits

The code that grabs images from video is from the MDN sample at https://github.com/mdn/samples-server
