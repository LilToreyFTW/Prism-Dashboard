// Purpose: Console authentication screen for the current PrismDashboard skeleton.
// Dependencies: AuthManager async operations and standard console I/O.
// Integration notes: Replace this console surface with the detected GUI framework when ImGui/GLFW files exist.
#include "AuthScreen.hpp"

#include <Windows.h>

#include <chrono>
#include <iostream>
#include <limits>
#include <string>
#include <thread>

namespace {

void SecureClearInput(std::string& value)
{
    if (!value.empty()) {
        SecureZeroMemory(value.data(), value.size());
        value.clear();
        value.shrink_to_fit();
    }
}

std::string ReadLine(const char* prompt)
{
    std::string value;
    std::cout << prompt;
    std::getline(std::cin, value);
    return value;
}

} // namespace

AuthScreen::AuthScreen(AuthManager& authManager)
    : authManager_(authManager)
{
}

bool AuthScreen::Run()
{
    while (true) {
        std::cout << "\n=== PrismDashboard Authentication ===\n";
        std::cout << "1. Login\n";
        std::cout << "2. Register\n";
        std::cout << "3. License key\n";
        std::cout << "4. Exit\n";
        std::cout << "Select an option: ";

        std::string choice;
        std::getline(std::cin, choice);

        if (choice == "1" && RunLogin()) {
            return true;
        }

        if (choice == "2" && RunRegister()) {
            return true;
        }

        if (choice == "3" && RunLicense()) {
            return true;
        }

        if (choice == "4") {
            return false;
        }

        if (choice != "1" && choice != "2" && choice != "3" && choice != "4") {
            std::cout << "Please choose 1, 2, 3, or 4.\n";
        }
    }
}

bool AuthScreen::RunLogin()
{
    std::string username = ReadLine("Username: ");
    std::string password = ReadLine("Password: ");

    auto operation = authManager_.LoginAsync(username, password);
    SecureClearInput(password);

    AuthResult result = WaitForResult(operation);
    PrintResult(result);
    return result.success;
}

bool AuthScreen::RunRegister()
{
    std::string username = ReadLine("Username: ");
    std::string password = ReadLine("Password: ");
    std::string confirmPassword = ReadLine("Confirm password: ");
    std::string licenseKey = ReadLine("License key: ");

    if (password != confirmPassword) {
        SecureClearInput(password);
        SecureClearInput(confirmPassword);
        SecureClearInput(licenseKey);
        PrintResult(AuthResult{ false, AuthError::ValidationFailed, "Passwords do not match.", {} });
        return false;
    }

    auto operation = authManager_.RegisterAsync(username, password, licenseKey);
    SecureClearInput(password);
    SecureClearInput(confirmPassword);
    SecureClearInput(licenseKey);

    AuthResult result = WaitForResult(operation);
    PrintResult(result);
    return result.success;
}

bool AuthScreen::RunLicense()
{
    std::string licenseKey = ReadLine("License key: ");

    auto operation = authManager_.LicenseAsync(licenseKey);
    SecureClearInput(licenseKey);

    AuthResult result = WaitForResult(operation);
    PrintResult(result);
    return result.success;
}

AuthResult AuthScreen::WaitForResult(std::future<AuthResult>& operation)
{
    std::cout << "Authenticating";
    while (operation.wait_for(std::chrono::milliseconds(100)) != std::future_status::ready) {
        std::cout << ".";
        std::cout.flush();
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    std::cout << "\n";
    return operation.get();
}

void AuthScreen::PrintResult(const AuthResult& result) const
{
    if (result.success) {
        std::cout << "Success: " << result.message << "\n";
        return;
    }

    std::cout << "Error: " << result.message << "\n";
}
