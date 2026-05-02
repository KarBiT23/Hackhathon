import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class BuyerPanel extends StatefulWidget {
  const BuyerPanel({super.key});

  @override
  State<BuyerPanel> createState() => _BuyerPanelState();
}

class _BuyerPanelState extends State<BuyerPanel> {
  int selectedIndex = 0;
  final List<Map<String, dynamic>> favoriteProducts = [];

  bool isFavorite(Map<String, dynamic> product) {
    return favoriteProducts.any((item) => item["id"] == product["id"]);
  }

  void toggleFavorite(Map<String, dynamic> product) {
    setState(() {
      if (isFavorite(product)) {
        favoriteProducts.removeWhere((item) => item["id"] == product["id"]);
      } else {
        favoriteProducts.add(product);
      }
    });
  }

  void openProductDetail(BuildContext context, Map<String, dynamic> data) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => ProductDetailPage(data: data)),
    );
  }

  Widget buildHomePage() {
    final stream = FirebaseFirestore.instance.collection("Urunler").snapshots();

    return Column(
      children: [
        SizedBox(
          height: 58,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(10),
            children: const [
              CategoryChip(title: "Kilim", selected: true),
              CategoryChip(title: "Halı"),
              CategoryChip(title: "Çömlek"),
              CategoryChip(title: "Vazo"),
              CategoryChip(title: "Seramik Tabak"),
            ],
          ),
        ),
        Container(
          margin: const EdgeInsets.all(14),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFB85C38), Color(0xFFE0A458)],
            ),
            borderRadius: BorderRadius.circular(18),
          ),
          child: const Row(
            children: [
              Icon(Icons.storefront, color: Colors.white, size: 48),
              SizedBox(width: 14),
              Expanded(
                child: Text(
                  "Nevşehir yöresel ürünlerini keşfet",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 21,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: StreamBuilder<QuerySnapshot>(
            stream: stream,
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return const Center(child: Text("Ürünler yüklenemedi"));
              }

              if (!snapshot.hasData) {
                return const Center(child: CircularProgressIndicator());
              }

              final docs = snapshot.data!.docs;

              if (docs.isEmpty) {
                return const Center(child: Text("Henüz ürün yok"));
              }

              return GridView.builder(
                padding: const EdgeInsets.all(14),
                itemCount: docs.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.65,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemBuilder: (context, index) {
                  final data = docs[index].data() as Map<String, dynamic>;
                  data["id"] = docs[index].id;

                  return ProductCard(
                    data: data,
                    isFavorite: isFavorite(data),
                    onFavoriteTap: () => toggleFavorite(data),
                    onTap: () => openProductDetail(context, data),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget buildFavoritesPage() {
    if (favoriteProducts.isEmpty) {
      return const Center(child: Text("Favorilere ürün eklenmedi"));
    }

    return GridView.builder(
      padding: const EdgeInsets.all(14),
      itemCount: favoriteProducts.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.65,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemBuilder: (context, index) {
        final data = favoriteProducts[index];

        return ProductCard(
          data: data,
          isFavorite: true,
          onFavoriteTap: () => toggleFavorite(data),
          onTap: () => openProductDetail(context, data),
        );
      },
    );
  }

  Widget buildPage() {
    if (selectedIndex == 0) return buildHomePage();
    if (selectedIndex == 2) return buildFavoritesPage();

    return const Center(child: Text("Bu sayfa henüz hazırlanmadı"));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F6F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Container(
          height: 42,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F1F1),
            borderRadius: BorderRadius.circular(22),
          ),
          child: const Row(
            children: [
              Icon(Icons.search, color: Colors.orange),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  "Marka, ürün veya kategori...",
                  style: TextStyle(color: Colors.black54, fontSize: 15),
                ),
              ),
              Icon(Icons.camera_alt_outlined, color: Colors.black54),
            ],
          ),
        ),
      ),
      body: buildPage(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: selectedIndex,
        onTap: (index) {
          setState(() {
            selectedIndex = index;
          });
        },
        selectedItemColor: Colors.orange,
        unselectedItemColor: Colors.black54,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Anasayfa"),
          BottomNavigationBarItem(icon: Icon(Icons.nfc), label: "RFID"),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite_border),
            label: "Favorilerim",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: "Sepet",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Hesap"),
        ],
      ),
    );
  }
}

class CategoryChip extends StatelessWidget {
  final String title;
  final bool selected;

  const CategoryChip({super.key, required this.title, this.selected = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(horizontal: 18),
      decoration: BoxDecoration(
        color: selected ? Colors.orange : Colors.white,
        borderRadius: BorderRadius.circular(22),
      ),
      alignment: Alignment.center,
      child: Text(
        title,
        style: TextStyle(color: selected ? Colors.white : Colors.black),
      ),
    );
  }
}

class ProductCard extends StatelessWidget {
  final Map<String, dynamic> data;
  final bool isFavorite;
  final VoidCallback onFavoriteTap;
  final VoidCallback onTap;

  const ProductCard({
    super.key,
    required this.data,
    required this.isFavorite,
    required this.onFavoriteTap,
    required this.onTap,
  });

  Widget productImage(String imageUrl) {
    if (imageUrl.isEmpty) {
      return Container(
        height: 150,
        color: const Color(0xFFF1F1F1),
        child: const Icon(Icons.image_not_supported),
      );
    }

    if (imageUrl.startsWith("assets/")) {
      return Image.asset(
        imageUrl,
        height: 150,
        width: double.infinity,
        fit: BoxFit.cover,
      );
    }

    return Image.network(
      imageUrl,
      height: 150,
      width: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          height: 150,
          color: const Color(0xFFF1F1F1),
          child: const Icon(Icons.image_not_supported),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = data["isim"]?.toString() ?? "";
    final category = data["kategori"]?.toString() ?? "";
    final price = data["fiyat"]?.toString() ?? "";
    final imageUrl = data["imageUrl"]?.toString() ?? "";

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.black12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(14),
                  ),
                  child: productImage(imageUrl),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      category,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: GestureDetector(
                    onTap: onFavoriteTap,
                    child: CircleAvatar(
                      backgroundColor: Colors.white,
                      child: Icon(
                        isFavorite ? Icons.favorite : Icons.favorite_border,
                        color: isFavorite ? Colors.red : Colors.black87,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 5),
                  Text(
                    "$price TL",
                    style: const TextStyle(
                      color: Colors.deepOrange,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "Nevşehir yöresel ürün",
                    style: TextStyle(color: Colors.orange, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ProductDetailPage extends StatelessWidget {
  final Map<String, dynamic> data;

  const ProductDetailPage({super.key, required this.data});

  Widget imageWidget(String imageUrl) {
    if (imageUrl.startsWith("assets/")) {
      return Image.asset(
        imageUrl,
        width: double.infinity,
        height: 280,
        fit: BoxFit.cover,
      );
    }

    return Image.network(
      imageUrl,
      width: double.infinity,
      height: 280,
      fit: BoxFit.cover,
    );
  }

  @override
  Widget build(BuildContext context) {
    final name = data["isim"]?.toString() ?? "";
    final category = data["kategori"]?.toString() ?? "";
    final price = data["fiyat"]?.toString() ?? "";
    final rfid = data["rfidId"]?.toString() ?? "";
    final description = data["aciklama"]?.toString() ?? "";
    final video = data["videoUrl"]?.toString() ?? "";
    final imageUrl = data["imageUrl"]?.toString() ?? "";

    return Scaffold(
      backgroundColor: const Color(0xFFF6F6F6),
      appBar: AppBar(
        title: Text(name),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            imageWidget(imageUrl),
            Container(
              width: double.infinity,
              margin: const EdgeInsets.all(14),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "$price TL",
                    style: const TextStyle(
                      fontSize: 22,
                      color: Colors.deepOrange,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text("Kategori: $category"),
                  const SizedBox(height: 6),
                  Text("RFID: $rfid"),
                  const SizedBox(height: 16),
                  const Text(
                    "Ürün Açıklaması",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(description),
                  if (video.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Text(
                      "Video Bilgisi",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(video),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
