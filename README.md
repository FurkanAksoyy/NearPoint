# NearPoint 🚀  
A full-stack application to find nearby places using Google Places API.  

## 🌍 **About NearPoint**  
NearPoint is a location-based web application that helps users discover nearby places using geographic coordinates.  
Built with a modern tech stack including **Spring Boot, React, and PostgreSQL**, this application provides an intuitive interface for exploring points of interest around any location.

### 🔗 **Live Demo**  
- **Frontend:** [NearPoint Frontend](https://near-point.vercel.app)  
- **Backend API:** [NearPoint Backend](https://nearpoint-production.up.railway.app)  

---

## 📌 **Features**  
✅ Search for nearby places using **latitude, longitude, and radius**  
✅ Display results on **Google Maps** with custom markers  
✅ Filter results by **rating and place type**  
✅ View **place details** and navigate to **Google Maps**  
✅ **Search history** to revisit previous searches  

---

## ⚙ **Tech Stack**  

### **Backend** 🖥️  
- **Java 17+**  
- **Spring Boot**  
- **JPA/Hibernate**  
- **PostgreSQL**  
- **Google Places API**  

### **Frontend** 🌐  
- **React**  
- **React Bootstrap**  
- **Axios**  
- **React Router**  
- **FontAwesome**  

### **Deployment** 🚀  
- **Frontend:** Vercel  
- **Backend:** Railway  
- **Database:** Neon.tech (PostgreSQL)  

---

## 🛠️ **Installation and Setup**  

### **Prerequisites**  
Before starting, make sure you have installed:  
✅ **Java 17+**  
✅ **Node.js 18+**  
✅ **PostgreSQL**  
✅ **Google Places API Key**  

---

### **🔹 Backend Setup**  
1️⃣ **Clone the repository**  
```sh
git clone https://github.com/FurkanAksoyy/NearPoint.git
cd NearPoint
```

2️⃣ **Configure `application.properties`**  
Edit the `src/main/resources/application.properties` file:  
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/nearpoint
spring.datasource.username=your_username
spring.datasource.password=your_password
google.places.api.key=your_google_api_key
```

3️⃣ **Build and run the backend**  
```sh
./mvnw clean install
./mvnw spring-boot:run
```
The backend will start on `http://localhost:8070` 🚀  

---

### **🔹 Frontend Setup**  
1️⃣ **Navigate to the frontend directory**  
```sh
cd frontend
```

2️⃣ **Install dependencies**  
```sh
npm install
```

3️⃣ **Create a `.env` file and add:**  
```sh
REACT_APP_API_BASE_URL=http://localhost:8070
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_api_key
```

4️⃣ **Start the development server**  
```sh
npm start
```
The frontend will start on `http://localhost:3000` 🎨  

---

## 🛠️ **Usage**  
📍 **Enter latitude, longitude, and radius** values in the search form  
🔍 Click **"Search"** to find nearby places  
🗺️ Browse the results displayed on the **Google Map**  
🎯 Use **filters** to narrow down results by **type or rating**  
📌 Click on **markers** to view more details about places  
📖 Access your **search history** to revisit previous searches  

---

## 🚀 **Deployment**  
This project is set up for deployment using:  
✅ **Frontend:** Vercel  
✅ **Backend:** Railway  
✅ **Database:** Neon.tech (PostgreSQL)  

🔹 **Detailed deployment instructions** are available in the deployment documentation.  

---

## 📜 **License**  
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.  

---

## 🎉 **Acknowledgements**  
👏 **Google Places API** for providing location data  
🎨 **Bootstrap** for UI components  
💡 **All contributors** who have helped with the development  

---

🚀 **Created by [Furkan Aksoy](https://github.com/FurkanAksoyy)**
