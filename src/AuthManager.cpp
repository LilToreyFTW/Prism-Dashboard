// Purpose: Thread-safe authentication state manager for PrismDashboard.
// Dependencies: C++ standard library futures/mutexes and Windows credential clearing.
// Integration notes: KeyAuth headers and libraries are expected under auth/ when available.
#include "AuthManager.hpp"

#include <Windows.h>

#include <algorithm>
#include <utility>

namespace {

void SecureClear(std::string& value)
{
    if (!value.empty()) {
        SecureZeroMemory(value.data(), value.size());
        value.clear();
        value.shrink_to_fit();
    }
}

bool IsBlank(const std::string& value)
{
    return std::all_of(value.begin(), value.end(), [](unsigned char character) {
        return character == ' ' || character == '\t' || character == '\r' || character == '\n';
    });
}

AuthResult ValidationError(const std::string& message)
{
    return AuthResult{ false, AuthError::ValidationFailed, message, {} };
}

AuthResult MissingProviderError()
{
    return AuthResult{
        false,
        AuthError::MissingProvider,
        "KeyAuth integration files are not installed in auth/. Add the KeyAuth headers and library_x64.lib, then wire the exact API signatures in AuthManager.cpp.",
        {}
    };
}

} // namespace

AuthManager::AuthManager()
    : state_(AuthState::IDLE)
{
}

std::future<AuthResult> AuthManager::LoginAsync(std::string username, std::string password)
{
    SetLoading();
    return std::async(std::launch::async, [this, username = std::move(username), password = std::move(password)]() mutable {
        return Finish(Login(username, password));
    });
}

std::future<AuthResult> AuthManager::RegisterAsync(std::string username, std::string password, std::string licenseKey)
{
    SetLoading();
    return std::async(std::launch::async, [this, username = std::move(username), password = std::move(password), licenseKey = std::move(licenseKey)]() mutable {
        return Finish(Register(username, password, licenseKey));
    });
}

std::future<AuthResult> AuthManager::LicenseAsync(std::string licenseKey)
{
    SetLoading();
    return std::async(std::launch::async, [this, licenseKey = std::move(licenseKey)]() mutable {
        return Finish(License(licenseKey));
    });
}

std::future<AuthResult> AuthManager::LogoutAsync()
{
    SetLoading();
    return std::async(std::launch::async, [this]() {
        return Finish(Logout());
    });
}

AuthState AuthManager::GetState() const
{
    std::lock_guard<std::mutex> lock(mutex_);
    return state_;
}

AuthUser AuthManager::GetUser() const
{
    std::lock_guard<std::mutex> lock(mutex_);
    return user_;
}

std::string AuthManager::GetLastError() const
{
    std::lock_guard<std::mutex> lock(mutex_);
    return lastError_;
}

bool AuthManager::IsBusy() const
{
    return GetState() == AuthState::LOADING;
}

AuthResult AuthManager::Login(std::string& username, std::string& password)
{
    if (IsBlank(username) || IsBlank(password)) {
        SecureClear(password);
        return ValidationError("Username and password are required.");
    }

    AuthResult result = MissingProviderError();
    SecureClear(password);
    return result;
}

AuthResult AuthManager::Register(std::string& username, std::string& password, std::string& licenseKey)
{
    if (IsBlank(username) || IsBlank(password) || IsBlank(licenseKey)) {
        SecureClear(password);
        SecureClear(licenseKey);
        return ValidationError("Username, password, and license key are required.");
    }

    if (licenseKey.size() < 8) {
        SecureClear(password);
        SecureClear(licenseKey);
        return ValidationError("License key must be at least 8 characters.");
    }

    AuthResult result = MissingProviderError();
    SecureClear(password);
    SecureClear(licenseKey);
    return result;
}

AuthResult AuthManager::License(std::string& licenseKey)
{
    if (IsBlank(licenseKey)) {
        SecureClear(licenseKey);
        return ValidationError("License key is required.");
    }

    if (licenseKey.size() < 8) {
        SecureClear(licenseKey);
        return ValidationError("License key must be at least 8 characters.");
    }

    AuthResult result = MissingProviderError();
    SecureClear(licenseKey);
    return result;
}

AuthResult AuthManager::Logout()
{
    return AuthResult{ true, AuthError::None, "Signed out.", {} };
}

void AuthManager::SetLoading()
{
    std::lock_guard<std::mutex> lock(mutex_);
    state_ = AuthState::LOADING;
    lastError_.clear();
}

AuthResult AuthManager::Finish(AuthResult result)
{
    std::lock_guard<std::mutex> lock(mutex_);
    state_ = result.success ? AuthState::SUCCESS : AuthState::FAILED;
    user_ = result.success ? result.user : AuthUser{};
    lastError_ = result.success ? std::string{} : result.message;
    return result;
}
