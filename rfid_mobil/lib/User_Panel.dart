import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class UserPanel extends StatefulWidget {
  const UserPanel({super.key});

  @override
  State<UserPanel> createState() => _UserPanelState();
}

class _UserPanelState extends State<UserPanel> {
  final productNameController = TextEditingController();
  final categoryController = TextEditingController();
  final priceController = TextEditingController();
  final rfidIdController = TextEditingController();
  final descriptionController = TextEditingController();
  final videoController = TextEditingController();
  final imageController = TextEditingController();

  Future<void> addProduct() async {
    final name = productNameController.text.trim();
    final category = categoryController.text.trim();
    final price = priceController.text.trim();
    final rfid = rfidIdController.text.trim();
    final description = descriptionController.text.trim();
    final video = videoController.text.trim();
    final image = imageController.text.trim();

    if (name.isEmpty || price.isEmpty || rfid.isEmpty || image.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Ürün adı, fiyat, RFID ve resim boş olamaz"),
        ),
      );
      return;
    }

    await FirebaseFirestore.instance.collection("Urunler").add({
      "isim": name,
      "kategori": category.isEmpty ? "Yöresel Ürün" : category,
      "fiyat": price,
      "rfidId": rfid,
      "aciklama": description,
      "videoUrl": video,
      "imageUrl": image,
      "createdAt": FieldValue.serverTimestamp(),
    });

    productNameController.clear();
    categoryController.clear();
    priceController.clear();
    rfidIdController.clear();
    descriptionController.clear();
    videoController.clear();
    imageController.clear();

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text("Ürün Firebase'e kaydedildi")));
  }

  Widget field({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hint,
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
    );
  }

  @override
  void dispose() {
    productNameController.dispose();
    categoryController.dispose();
    priceController.dispose();
    rfidIdController.dispose();
    descriptionController.dispose();
    videoController.dispose();
    imageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6E7D8),
      appBar: AppBar(
        title: const Text("Satıcı Paneli"),
        backgroundColor: const Color(0xFFB85C38),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
          ),
          child: Column(
            children: [
              field(
                controller: productNameController,
                label: "Ürün adı",
                icon: Icons.inventory_2,
              ),
              field(
                controller: categoryController,
                label: "Kategori",
                hint: "Kilim, Halı, Çömlek, Vazo...",
                icon: Icons.category,
              ),
              field(
                controller: priceController,
                label: "Fiyat",
                hint: "850",
                icon: Icons.payments,
              ),
              field(
                controller: rfidIdController,
                label: "RFID / NFC ID",
                hint: "RFID001",
                icon: Icons.nfc,
              ),
              field(
                controller: descriptionController,
                label: "Ürün açıklaması",
                icon: Icons.description,
                maxLines: 3,
              ),
              field(
                controller: videoController,
                label: "Video linki",
                icon: Icons.video_library,
              ),
              field(
                controller: imageController,
                label: "Resim yolu",
                hint: "assets/Pot.jpg",
                icon: Icons.image,
              ),
              const SizedBox(height: 8),
              const Text(
                "Örnek resim yolları:\nassets/bowl.jpeg\nassets/Pot.jpg\nassets/rug.jpeg\nassets/scatter rug.jpeg\nassets/vase.jpg",
                style: TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: addProduct,
                  icon: const Icon(Icons.add),
                  label: const Text("Ürünü Firebase'e Kaydet"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFB85C38),
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
