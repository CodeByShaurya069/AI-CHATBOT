const API_KEY = "Your_API_key_";

const chatContainer =
document.getElementById("chat-container");

const promptInput =
document.getElementById("prompt");

let selectedImage = null;

/* IMAGE SELECT */

document
.getElementById("imageInput")
.addEventListener("change", function(event){

    selectedImage = event.target.files[0];

});

/* SEND MESSAGE */

async function sendMessage(){

    const userText = promptInput.value.trim();

    if(userText === "" && !selectedImage){
        return;
    }

    /* USER MESSAGE */

    const userDiv =
    document.createElement("div");

    userDiv.className = "user-message";

    if(userText){

        const text =
        document.createElement("p");

        text.innerText = userText;

        userDiv.appendChild(text);
    }

    /* IMAGE PREVIEW */

    if(selectedImage){

        const img =
        document.createElement("img");

        img.src =
        URL.createObjectURL(selectedImage);

        userDiv.appendChild(img);
    }

    chatContainer.appendChild(userDiv);

    promptInput.value = "";

    scrollBottom();

    /* AI MESSAGE */

    const aiDiv =
    document.createElement("div");

    aiDiv.className = "ai-message";

    aiDiv.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatContainer.appendChild(aiDiv);

    scrollBottom();

    try{

        let parts = [];

        if(userText){

            parts.push({
                text:userText
            });

        }

        /* IMAGE */

        if(selectedImage){

            const imagePart =
            await fileToGenerativePart(
                selectedImage
            );

            parts.push(imagePart);

        }

        /* API */

        const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                contents:[
                    {
                        parts:parts
                    }
                ]

            })

        });

        const data = await response.json();

console.log(data);

if(data.candidates){

    const reply =
    data.candidates[0]
    .content.parts[0].text;

    aiDiv.innerHTML =
    marked.parse(reply);

}
else{

    aiDiv.innerHTML =
    `
    ❌ API Error
    <br><br>
    ${data.error.message}
    `;

}

    }

    catch(error){

        console.log(error);

        aiDiv.innerHTML =
        "❌ Error loading response";

    }

    selectedImage = null;

    scrollBottom();
}

/* ENTER KEY */

promptInput.addEventListener(
"keydown",
function(e){

    if(e.key === "Enter"){

        sendMessage();

    }

});

/* SCROLL */

function scrollBottom(){

    chatContainer.scrollTop =
    chatContainer.scrollHeight;

}

/* IMAGE -> BASE64 */

async function fileToGenerativePart(file){

    return new Promise((resolve)=>{

        const reader =
        new FileReader();

        reader.onloadend = ()=>{

            const base64Data =
            reader.result.split(",")[1];

            resolve({

                inline_data:{

                    mime_type:file.type,

                    data:base64Data

                }

            });

        };

        reader.readAsDataURL(file);

    });

}