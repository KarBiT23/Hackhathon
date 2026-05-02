import 'dart:io';

import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:extension_google_sign_in_as_googleapis_auth/extension_google_sign_in_as_googleapis_auth.dart';

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

  File? selectedImageFile;
  bool isUploading = false;

  final String driveFolderId = "15pe157KOt2QVabVgTSnNACxdiLoLN-r3";

  Future<void> takePhoto() async {
    final picker = ImagePicker();

    final pickedFile = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
    );

    if (pickedFile == null) return;

    setState(() {
      selectedImageFile = File(pickedFile.path);
      imageController.text = pickedFile.path;
    });
  }

  Future<String?> uploadImageToDrive(File imageFile) async {
    final googleSignIn = GoogleSignIn(scopes: [drive.DriveApi.driveFileScope]);

    final account = await googleSignIn.signIn();

    if (account == null) {
      return null;
    }

    final authClient = await googleSignIn.authenticatedClient();

    if (authClient == null) {
      return null;
    }

    final driveApi = drive.DriveApi(authClient);

    final fileName = "urun_${DateTime.now().millisecondsSinceEpoch}.jpg";

    final driveFile = drive.File()
      ..name = fileName
      ..parents = [driveFolderId];

    final media = drive.Media(imageFile.openRead(), imageFile.lengthSync());

    final uploadedFile = await driveApi.files.create(
      driveFile,
      uploadMedia: media,
    );

    if (uploadedFile.id == null) {
      return null;
    }

    await driveApi.permissions.create(
      drive.Permission()
        ..type = "anyone"
        ..role = "reader",
      uploadedFile.id!,
    );

    return "https://drive.google.com/uc?export=view&id=${uploadedFile.id}";
  }

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

    String image = fixImagePath(imageController.text);

    final fiyat = double.tryParse(price) ?? 0;

    if (name.isEmpty || rfid.isEmpty || image.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Ürün adı, RFID ve resim boş olamaz")),
      );
      return;
    }

    try {
      setState(() {
        isUploading = true;
      });

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

      if (selectedImageFile != null) {
        final driveUrl = await uploadImageToDrive(selectedImageFile!);

        if (driveUrl == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Fotoğraf Drive'a yüklenemedi")),
          );
          return;
        }

        image = driveUrl;
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

      setState(() {
        selectedImageFile = null;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Ürün Firebase'e kaydedildi")),
      );
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Firebase kayıt hatası: $e")));
    } finally {
      if (mounted) {
        setState(() {
          isUploading = false;
        });
      }
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

              if (selectedImageFile != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.file(
                      selectedImageFile!,
                      height: 180,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),

              field(
                controller: imageController,
                label: "imageUrl",
                hint: "Kamera ile fotoğraf çekince otomatik dolar",
                icon: Icons.image,
              ),

              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton.icon(
                  onPressed: isUploading ? null : takePhoto,
                  icon: const Icon(Icons.camera_alt),
                  label: const Text("Kamera ile Fotoğraf Çek"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),

              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: isUploading ? null : addProduct,
                  icon: isUploading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.add),
                  label: Text(
                    isUploading
                        ? "Drive'a yükleniyor..."
                        : "Ürünü Firebase'e Kaydet",
                  ),
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
