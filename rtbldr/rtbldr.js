
// ******************************** init consts etc ***************************************************
// Create an array of circle colors
const circleColors = ["blue", "#8B8000","green", "red", "black"];
// Create a variable to track the current circle color index
let currentCircleColorIndex = 0;
// Create an array to store the circles
const circles = [];
// scaling image vs canvas - for converting coordinates
var gloScalingFactor;
// Create a new image object
const image = new Image();
image.addEventListener('error', imageNotFound);
function imageNotFound() {
    alert('That image was not found.');
}

const canvas = document.querySelector("#canvas");
const imageUrlInput = document.querySelector("#imageUrl");	
const encodedUrlField = document.querySelector("#encodedURL");
const routeName = document.querySelector("#routeName");
const routeGrade = document.querySelector("#routeGrade");
const clearBtn = document.querySelector("#clearBtn");

// ******************************** event listeners ***************************************************
// Load the image from the URL input element
imageUrlInput.addEventListener("change", () => {
    circles.splice(0, circles.length);
    image.src = imageUrlInput.value;
});

routeGrade.addEventListener("change", () => {
    updateBookmark();
});
routeGrade.addEventListener("change", () => {
    updateBookmark();
});

// ******************************** init from optional query parameters passed to the page **********************
const urlSearchParams = new URLSearchParams(window.location.search);
// Check if the query parameters are present
if (urlSearchParams.has('imageUrl') && urlSearchParams.has('circles')) {
    circles.splice(0, circles.length);
    // Deserialize the query parameters
    const bookmark = {
    imageUrl: urlSearchParams.get('imageUrl'),
    circleList: urlSearchParams.get('circles').split(';').map((circle) => {
        const [x, y, colorIndex] = circle.split(',');
        return { x: parseInt(x), y: parseInt(y), colorIndex: parseInt(colorIndex) };
    }),
    name: urlSearchParams.get('name'),
    grade: urlSearchParams.get('grade'),
    };
    
    const canvasContext = canvas.getContext("2d");

    imageUrlInput.value = bookmark.imageUrl;
    image.src = bookmark.imageUrl;
    routeName.value = bookmark.name;
    routeGrade.value = bookmark.grade;

    bookmark.circleList.forEach((circleData) => {
    console.log(circleData);
    // Create a new circle
    const circle = {
        x: circleData.x,
        y: circleData.y,
        radius: 15,
        color: circleColors[circleData.colorIndex],
        stroke: true,
        colorIndex: circleData.colorIndex,
    };

    // Add the circle to the circles array
    circles.push(circle);

    // Draw the circle on the canvas
    //canvasContext.strokeStyle = circle.color;
    //canvasContext.lineWidth = 2.5;
    //canvasContext.beginPath();
    //canvasContext.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    //canvasContext.stroke();	 
    });
    updateBookmark();
}

// ******************************** event listeners - Once the image has loaded, draw it on the canvas***************************************************
image.onload = () => {
    const canvasContext = canvas.getContext("2d");
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Get the width and height of the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    // Get the width and height of the image
    imageRenderWidth = image.width;
    imageRenderHeight = image.height;

    //get the minimum amount to downscale image in order to fit into canvas, depending on dimensions. No downscale if smaller than canvas (1)
    gloScalingFactor = Math.min(Math.min(canvas.width / image.width, canvas.height / image.height),1);

    canvasContext.drawImage(image, 0, 0, image.width*gloScalingFactor, image.height*gloScalingFactor);  

    // Redraw all of the circles in the circles array if there are any
    circles.forEach((circle) => {
        canvasContext.strokeStyle = circle.color;
        canvasContext.lineWidth = 2.5;
        canvasContext.beginPath();
        canvasContext.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
        canvasContext.stroke();
    });



};

// ******************************** update bookmark link***************************************************
function updateBookmark() {
    // Get the image URL, name, and grade from the fields
    const imageUrl = imageUrlInput.value;
    const name = routeName.value;
    const grade = routeGrade.value;

    //create bookmark of current data
    const bookmark = {
        imageUrl,
        name,
        grade,
        circles: circles.map((circle) => {
            return `${circle.x},${circle.y},${circle.colorIndex}`;
        }).join(';'),
        name,
        grade,
    };
    // Encode the bookmark object to URL-encoded string
    const encodedBookmark = new URLSearchParams(bookmark).toString();
    // Set the bookmark field value to the encoded bookmark
    history.pushState({}, '', window.location.pathname + '?' + encodedBookmark);
    encodedUrlField.href = window.location.pathname + '?' + encodedBookmark;
}


// Get the canvas context
const canvasContext = canvas.getContext("2d");

// ******************************** Add the click code to the canvas ********************************
canvas.addEventListener("click", (event) => {
    // Get the mouse coordinates relative to the canvas
    const mouseX = event.offsetX // gloScalingFactor;
    const mouseY = event.offsetY // gloScalingFactor;

    // Check if the user clicked on an existing circle
    const nearestCircle = circles.find((circle) => {
    const distance = Math.sqrt((circle.x - mouseX) ** 2 + (circle.y - mouseY) ** 2);
    return distance <= circle.radius;
    });

    // If the user clicked on an existing circle, modify it
    if (nearestCircle) {
        // Increment the circle color index
        nearestCircle.colorIndex = (nearestCircle.colorIndex+1) % (circleColors.length);

        // Update the circle color
        nearestCircle.color = circleColors[nearestCircle.colorIndex];

        // If the circle color index is at the end of the color list, remove the circle from the canvas
        if (nearestCircle.colorIndex === circleColors.length-1) {
            // Remove the circle from the circles array
            circles.splice(circles.indexOf(nearestCircle), 1);

            // Clear the canvas
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            canvasContext.drawImage(image, 0, 0, image.width*gloScalingFactor, image.height*gloScalingFactor);    

            // Redraw all of the circles in the circles array
            circles.forEach((circle) => {
            canvasContext.strokeStyle = circle.color;
            canvasContext.lineWidth = 2.5;
            canvasContext.beginPath();
            canvasContext.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
            canvasContext.stroke();
            });
        } else {
            // redraw circle with next color
            canvasContext.strokeStyle = nearestCircle.color;
            canvasContext.lineWidth = 2.5;
            canvasContext.beginPath();
            canvasContext.arc(nearestCircle.x, nearestCircle.y, nearestCircle.radius, 0, 2 * Math.PI, false);
            canvasContext.stroke();
        }
    } else {
        // The user clicked on a blank space
        // Create a new circle
        const circle = {
            x: mouseX,
            y: mouseY,
            radius: 15,
            color: circleColors[currentCircleColorIndex],
            stroke: true,
            colorIndex: currentCircleColorIndex,
        };

        // Add the circle to the circles array
        circles.push(circle);

        // Draw the circle on the canvas
        canvasContext.strokeStyle = circle.color;
        canvasContext.lineWidth = 2.5;
        canvasContext.beginPath();
        canvasContext.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
        canvasContext.stroke();
        }
        
        updateBookmark();
    
});


//********************* optional upload new image *********************************
document.getElementById('submitBtn').addEventListener('click', function () {
    var formData = new FormData();
    formData.append("image", document.getElementById('myFile').files[0]);

    fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
            "Authorization": "Client-ID e57edad8197fd8f"
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        var photo = data.data.link;
        var photo_hash = data.data.deletehash;
        imageUrlInput.value = photo;
        circles.splice(0, circles.length); //reset circles
        image.src = photo;
        updateBookmark();
    })
    .catch(error => {
        console.error("Error:", error);
    });
});

//********************* optional reset circles *********************************
document.getElementById('clearBtn').addEventListener('click', function () {
    circles.splice(0, circles.length); //reset circles

    // Clear the canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.drawImage(image, 0, 0, image.width*gloScalingFactor, image.height*gloScalingFactor);  
    updateBookmark();
});
