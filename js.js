(function () {
    // The width and height of the captured photo. We will set the
    // width to the value defined here, but the height will be
    // calculated based on the aspect ratio of the input stream.

    let width = 320;    // We will scale the photo width to this
    let height = 0;     // This will be computed based on the input stream

    // |streaming| indicates whether or not we're currently streaming
    // video from the camera. Obviously, we start at false.

    let streaming = false;

    // The various HTML elements we need to configure or control. These
    // will be set by the startup() function.

    let video;
    let canvas;
    let prediction;
    let url;

    function startup() {
        video       = document.getElementById('video');
        canvas      = document.getElementById('canvas');
        prediction  = document.getElementById('prediction');
        url         = document.getElementById('url');

        url.value = localStorage.getItem('url');

        function updateDate(){
            const currentDate = new Date();
            const date = currentDate.getDate();
            const dateString = currentDate.toLocaleDateString(undefined, {month: "short", day: "numeric"});
            const timeString = currentDate.toLocaleTimeString(undefined, {timeStyle: "short"});

            let superscript = 'th';
            if (date === 1 || date === 21 || date ===31) {
                superscript = 'st';
            } else if (date === 2 || date === 22) {
                superscript = 'nd';
            } else if (date === 3 || date === 23) {
                superscript = 'rd';
            }
            document.getElementById('date').innerHTML = `${dateString}<sup>${superscript}</sup>`;
            document.getElementById('time').innerHTML = `${timeString}`;
        }
        setInterval(updateDate, 1000);

        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (err) {
                console.log("An error occurred: " + err);
            });

        video.addEventListener('canplay', ev => {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                // Firefox currently has a bug where the height can't be read from
                // the video, so we will make assumptions if this happens.

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        function predict() {
            let context = canvas.getContext('2d');
            if (width && height) {
                context.save();
                canvas.width = width;
                canvas.height = height;
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, width*-1, height);

                let data = canvas.toDataURL('image/jpeg');
                context.restore();

                if (url.value) {
                    fetch(url.value, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            inputs: {
                                Image: data.substring(data.indexOf(",") + 1),
                            },
                            key: "d6f63a1e-05ea-436f-8401-f22cfb873beb",
                        }),
                    })
                        .then(result => result.json())
                        .then(result => {
                            const _prediction = result.outputs.Labels;
                            let rows = '';
                            const maxBarWidth = 207;
                            _prediction.map(row => {
                                const [label, confidence] = row;
                                const percentage = (confidence * 100).toFixed(0);
                                const barWidth = confidence * maxBarWidth;
                                const barOpacity = .15 + confidence * .85;
                                rows += `<tr>
                                            <td class="label">${label}</td><td class="percent">${percentage}%</td><td><div class="prediction-bar" style="width: ${barWidth}px; opacity: ${barOpacity}"></div></td>
                                        </tr>`
                            });
                            prediction.innerHTML = rows;
                            setTimeout(predict, 10);
                        })
                        .catch(err => {
                            prediction.innerHTML = err;
                            setTimeout(predict, 500);
                        });
                } else {
                    prediction.innerHTML = "Please supply a valid URL";
                    setTimeout(predict, 500);
                }
            } else {
                console.log("couldn't get frame");
                setTimeout(predict, 500);
            }
        }
        predict();

        url.addEventListener('change', ev => {
            console.log("url", ev);
            localStorage.setItem('url', ev.target.value);
        }, false);
    }

    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener('load', startup, false);
})();
