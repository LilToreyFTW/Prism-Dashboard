#include <iostream>

#include "AuthManager.hpp"
#include "AuthScreen.hpp"

int main() {
    std::cout << "PrismDashboard Starting...\n";

    AuthManager authManager;
    AuthScreen authScreen(authManager);

    if (!authScreen.Run()) {
        std::cout << "Authentication cancelled.\n";
        std::cout << "\nPress Enter to exit...";
        std::cin.get();
        return 0;
    }

    AuthUser user = authManager.GetUser();
    std::cout << "Welcome, " << user.username << ".\n";
    std::cout << "Ready for the PrismDashboard main application.\n";
    std::cout << "\nPress Enter to exit...";
    std::cin.get();
    return 0;
}
