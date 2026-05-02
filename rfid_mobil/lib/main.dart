import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart'; // 🔥 EKLENDİ

import 'User_Panel.dart';
import 'buyer_panel.dart';
import 'lang.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: LoginPanel(),
    );
  }
}

class LoginPanel extends StatefulWidget {
  const LoginPanel({super.key});

  @override
  State<LoginPanel> createState() => _LoginPanelState();
}

class _LoginPanelState extends State<LoginPanel> {
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  // 🔥 LOGIN + ROLE OKUMA
  Future<void> login() async {
    final username = usernameController.text.trim();
    final password = passwordController.text.trim();

    String email = "";

    if (username == "satici") {
      email = "satici@test.com";
    } else if (username == "alici") {
      email = "alici@test.com";
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(Lang.t("loginError"))));
      return;
    }

    try {
      // 🔥 Firebase login
      final userCredential = await FirebaseAuth.instance
          .signInWithEmailAndPassword(email: email, password: password);

      final user = userCredential.user;

      if (user == null) {
        throw Exception("Kullanıcı bulunamadı");
      }

      // 🔥 Firestore’dan rol çek
      final doc = await FirebaseFirestore.instance
          .collection("Users")
          .doc(user.uid)
          .get();

      if (!doc.exists) {
        throw Exception("Firestore'da kullanıcı yok");
      }

      final role = doc.data()?["role"];

      // 🔥 Role göre yönlendirme
      if (role == "seller") {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const UserPanel()),
        );
      } else if (role == "buyer") {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const BuyerPanel()),
        );
      } else {
        throw Exception("Rol tanımlı değil");
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Firebase kayıt hatası: $e")));
    }
  }

  // 🌍 Dil seçme (DEĞİŞMEDİ)
  void showLanguageDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
          ),
          title: Text(Lang.t("selectLanguage")),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: Lang.current == "tr"
                    ? const Icon(Icons.check, color: Colors.green)
                    : const SizedBox(width: 24),
                title: Text(Lang.t("turkish")),
                onTap: () {
                  setState(() {
                    Lang.current = "tr";
                  });
                  Navigator.pop(context);
                },
              ),
              ListTile(
                leading: Lang.current == "en"
                    ? const Icon(Icons.check, color: Colors.green)
                    : const SizedBox(width: 24),
                title: Text(Lang.t("english")),
                onTap: () {
                  setState(() {
                    Lang.current = "en";
                  });
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    usernameController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,

      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: Colors.white),
            onPressed: showLanguageDialog,
          ),
        ],
      ),

      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset("assets/bg.png", fit: BoxFit.cover),
          ),
          Positioned.fill(
            child: Container(color: Colors.black.withOpacity(0.25)),
          ),

          SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.nfc, size: 60, color: Color(0xFF8B3E20)),

                      const SizedBox(height: 20),

                      TextField(
                        controller: usernameController,
                        decoration: InputDecoration(
                          labelText: Lang.t("username"),
                          prefixIcon: const Icon(Icons.person),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      TextField(
                        controller: passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          labelText: Lang.t("password"),
                          prefixIcon: const Icon(Icons.lock),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFB85C38),
                            foregroundColor: Colors.white,
                          ),
                          child: Text(Lang.t("login")),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
