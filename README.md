# Amazon Clone E-commerce App

## Overview

This project is a fully functional e-commerce application built using Flutter for the frontend, NodeJS for the backend server, and MongoDB for the database management. It replicates essential features of a typical online shopping platform, including user operations and admin management functionalities.

## Features

### User Features
- **Product Search**: Users can search for products by name or category.
- **Product Categories**: View and browse products by different categories.
- **Product Details**: Detailed view of each product including images, descriptions, and ratings.
- **Product Reviews**: Users can rate products.
- **Cart Management**: Add, remove, and update products in the shopping cart.
- **Order Placement**: Place orders for products in the cart.
- **Payment Processing**: Secure payment processing using Google Pay (GPay).
- **Order Tracking**: View the status of placed orders.

### Admin Features
- **Product Management**: Add, update, and delete products from the inventory.
- **Order Management**: Manage and update the status of orders.
- **Revenue Statistics**: View detailed statistics on revenue and sales performance.

## Tech Stack

- **Frontend**: Flutter
- **Backend**: NodeJS
- **Database**: MongoDB

## Getting Started

### Prerequisites
- Flutter SDK
- NodeJS
- MongoDB

### Installation

1. **Clone the repository**
   ```sh
   git clone git@github.com:tvnkhanh/amazon.git
   ```

2. **Backend Setup**

   - Navigate to the `server` directory.
     ```sh
     cd amazon-clone/server
     ```
   - Install backend dependencies.
     ```sh
     npm install
     ```
   - Start the NodeJS server.
     ```sh
     npm run dev
     ```

3. **Frontend Setup**

   - Navigate to the `frontend` directory.
     ```sh
     cd ..
     ```
   - Install Flutter dependencies.
     ```sh
     flutter pub get
     ```
   - Run the Flutter app.
     ```sh
     flutter run
     ```

## Usage

Once the server and the Flutter app are running, you can use the app to browse products, place orders, and perform admin management tasks. The app should be accessible on your local device or emulator.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Khanh Tu Van - tuvankhanh2002@gmail.com

Project Link: https://github.com/tvnkhanh/amazon

## Acknowledgements

- [Flutter](https://flutter.dev/)
- [NodeJS](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Google Pay](https://pay.google.com/)
