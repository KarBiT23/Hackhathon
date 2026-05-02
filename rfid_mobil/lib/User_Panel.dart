import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:nfc_manager/nfc_manager.dart';

import 'seller_products_page.dart';

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
  final imageController = TextEditingController();

  Future<void> startNfcRead() async {
    final isAvailable =
        await NfcManager.instance.checkAvailability() ==
        NfcAvailability.enabled;

    if (!isAvailable) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Bu cihazda NFC desteklenmiyor")),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("RFID / NFC kartı telefona yaklaştırın")),
    );

    NfcManager.instance.startSession(
      pollingOptions: {NfcPollingOption.iso14443, NfcPollingOption.iso15693},
      onDiscovered: (NfcTag tag) async {
        final String tagId = tag.toString();

        setState(() {
          rfidIdController.text = tagId;
        });

        await NfcManager.instance.stopSession();
      },
    );
  }

  String fixImagePath(String value) {
    String image = value.trim().replaceAll("\\", "/");

    final assetIndex = image.toLowerCase().indexOf("assets/");
    if (assetIndex != -1) {
      image = image.substring(assetIndex);
    }

    return image;
  }

  Future<void> addProduct() async {
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Önce giriş yapmalısın")));
      return;
    }

    final name = productNameController.text.trim();
    final category = categoryController.text.trim();
    final price = priceController.text.trim();
    final rfid = rfidIdController.text.trim();
    final description = descriptionController.text.trim();
    final image = fixImagePath(imageController.text);

    final fiyat = double.tryParse(price) ?? 0;

    if (name.isEmpty || rfid.isEmpty || image.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Ürün adı, RFID ve resim boş olamaz")),
      );
      return;
    }

    try {
      final existingRfid = await FirebaseFirestore.instance
          .collection("Urunler")
          .where("RFID", isEqualTo: rfid)
          .limit(1)
          .get();

      if (existingRfid.docs.isNotEmpty) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Bu RFID zaten kayıtlı")));
        return;
      }

      await FirebaseFirestore.instance.collection("Urunler").add({
        "isim": name,
        "Category": category,
        "Explanation": description,
        "RFID": rfid,
        "fiyat": fiyat,
        "imageUrl": image,
        "sellerId": user.uid,
        "createdAt": FieldValue.serverTimestamp(),
      });

      productNameController.clear();
      categoryController.clear();
      priceController.clear();
      rfidIdController.clear();
      descriptionController.clear();
      imageController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Ürün Firebase'e kaydedildi")),
      );
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Firebase kayıt hatası: $e")));
    }
  }

  Widget field({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hint,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
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
    imageController.dispose();

    try {
      NfcManager.instance.stopSession();
    } catch (_) {}

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
                label: "İsim",
                icon: Icons.inventory_2,
              ),
              field(
                controller: categoryController,
                label: "Category",
                icon: Icons.category,
              ),
              field(
                controller: descriptionController,
                label: "Explanation",
                icon: Icons.description,
                maxLines: 3,
              ),
              field(
                controller: rfidIdController,
                label: "RFID",
                icon: Icons.nfc,
              ),

              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton.icon(
                  onPressed: startNfcRead,
                  icon: const Icon(Icons.nfc),
                  label: const Text("RFID / NFC Oku"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),

              const SizedBox(height: 12),

              field(
                controller: priceController,
                label: "Fiyat",
                icon: Icons.payments,
                keyboardType: TextInputType.number,
              ),
              field(
                controller: imageController,
                label: "imageUrl",
                hint: "assets/bowl.jpeg",
                icon: Icons.image,
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

              const SizedBox(height: 12),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SellerProductsPage(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.list),
                  label: const Text("Benim Ürünlerim"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.brown,
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
