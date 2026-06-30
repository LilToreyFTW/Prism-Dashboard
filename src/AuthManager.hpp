// Purpose: Thread-safe authentication state manager for PrismDashboard.
// Dependencies: C++ standard library futures/mutexes and Windows credential clearing.
// Integration notes: KeyAuth headers and libraries are expected under auth/ when available.
#pragma once

#include <future>
#include <mutex>
#include <string>

enum class AuthState {
    IDLE,
    LOADING,
    SUCCESS,
    FAILED
};

enum class AuthError {
    None,
    MissingProvider,
    ValidationFailed,
    NetworkFailure,
    InvalidCredentials,
    LicenseExpired,
    BannedUser,
    UnexpectedResponse
};

struct AuthUser {
    std::string username;
    std::string expiry;
    std::string subscription;
};

struct AuthResult {
    bool success = false;
    AuthError error = AuthError::None;
    std::string message;
    AuthUser user;
};

class AuthManager {
public:
    AuthManager();

    std::future<AuthResult> LoginAsync(std::string username, std::string password);
    std::future<AuthResult> RegisterAsync(std::string username, std::string password, std::string licenseKey);
    std::future<AuthResult> LicenseAsync(std::string licenseKey);
    std::future<AuthResult> LogoutAsync();

    AuthState GetState() const;
    AuthUser GetUser() const;
    std::string GetLastError() const;
    bool IsBusy() const;

private:
    AuthResult Login(std::string& username, std::string& password);
    AuthResult Register(std::string& username, std::string& password, std::string& licenseKey);
    AuthResult License(std::string& licenseKey);
    AuthResult Logout();

    void SetLoading();
    AuthResult Finish(AuthResult result);

    mutable std::mutex mutex_;
    AuthState state_;
    AuthUser user_;
    std::string lastError_;
};
