import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:nfc_manager/nfc_manager.dart';

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

  final cargoTypeController = TextEditingController();
  final sallerLocationController = TextEditingController();
  final weightKgController = TextEditingController();
  final capacityController = TextEditingController();

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
    final name = productNameController.text.trim();
    final category = categoryController.text.trim();
    final price = priceController.text.trim();
    final rfid = rfidIdController.text.trim();
    final description = descriptionController.text.trim();
    final image = fixImagePath(imageController.text);

    final cargoType = cargoTypeController.text.trim();
    final sallerLocation = sallerLocationController.text.trim();
    final weightKg = double.tryParse(weightKgController.text.trim()) ?? 0;
    final capacity = int.tryParse(capacityController.text.trim()) ?? 0;
    final fiyat = double.tryParse(price) ?? 0;

    if (name.isEmpty || rfid.isEmpty || image.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Ürün adı, RFID ve resim boş olamaz")),
      );
      return;
    }

    final existingRfid = await FirebaseFirestore.instance
        .collection("Urunler")
        .where("RFID", isEqualTo: rfid)
        .limit(1)
        .get();

    if (existingRfid.docs.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Bu RFID / NFC zaten başka üründe kayıtlı"),
        ),
      );
      return;
    }

    await FirebaseFirestore.instance.collection("Urunler").add({
      "CargoType": cargoType,
      "Category": category,
      "Explanation": description,
      "RFID": rfid,
      "SallerLocation": sallerLocation,
      "WeightKg": weightKg,
      "capacity": capacity,
      "fiyat": fiyat,
      "imageUrl": image,
      "isim": name,
      "createdAt": FieldValue.serverTimestamp(),
    });

    productNameController.clear();
    categoryController.clear();
    priceController.clear();
    rfidIdController.clear();
    descriptionController.clear();
    imageController.clear();
    cargoTypeController.clear();
    sallerLocationController.clear();
    weightKgController.clear();
    capacityController.clear();

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text("Ürün başarıyla kaydedildi")));
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
    cargoTypeController.dispose();
    sallerLocationController.dispose();
    weightKgController.dispose();
    capacityController.dispose();

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
                hint: "Kilim, Halı, Çömlek, Vazo...",
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
                hint: "RFID001",
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
                controller: cargoTypeController,
                label: "CargoType",
                hint: "Kargo tipi",
                icon: Icons.local_shipping,
              ),
              field(
                controller: sallerLocationController,
                label: "SallerLocation",
                hint: "Satıcı konumu",
                icon: Icons.location_on,
              ),
              field(
                controller: weightKgController,
                label: "WeightKg",
                hint: "0",
                icon: Icons.monitor_weight,
                keyboardType: TextInputType.number,
              ),
              field(
                controller: capacityController,
                label: "capacity",
                hint: "0",
                icon: Icons.scale,
                keyboardType: TextInputType.number,
              ),
              field(
                controller: priceController,
                label: "fiyat",
                hint: "850",
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
            ],
          ),
        ),
      ),
    );
  }
}
