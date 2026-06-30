// Purpose: Console authentication screen for the current PrismDashboard skeleton.
// Dependencies: AuthManager async operations and standard console I/O.
// Integration notes: Replace this console surface with the detected GUI framework when ImGui/GLFW files exist.
#pragma once

#include "AuthManager.hpp"

class AuthScreen {
public:
    explicit AuthScreen(AuthManager& authManager);

    bool Run();

private:
    bool RunLogin();
    bool RunRegister();
    bool RunLicense();
    AuthResult WaitForResult(std::future<AuthResult>& operation);
    void PrintResult(const AuthResult& result) const;

    AuthManager& authManager_;
};
