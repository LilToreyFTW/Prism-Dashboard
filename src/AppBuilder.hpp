// Purpose: Project generator backend and optional Dear ImGui surface for PrismDashboard.
// Dependencies: C++20 filesystem/string utilities; Dear ImGui is optional at compile time.
// Integration notes: Call RenderImGui() from the future PrismDashboard ImGui frame loop.
#pragma once

#include <filesystem>
#include <string>
#include <vector>

enum class BuilderLanguage {
    Python,
    Cpp,
    CSharp,
    Java
};

enum class BuilderTemplate {
    Blank,
    Dashboard,
    LoginSystem,
    DataTool,
    Game
};

struct BuilderFeatureFlags {
    bool guiApplication = true;
    bool includeLicenseHeader = false;
    bool initializeGit = false;
    bool createZipArchive = true;
};

struct AppBuilderConfig {
    BuilderLanguage language = BuilderLanguage::Python;
    std::string framework = "CustomTkinter";
    BuilderTemplate templateKind = BuilderTemplate::Dashboard;
    std::string appName = "GeneratedApp";
    std::string version = "1.0.0";
    std::string iconPath;
    std::string theme = "Dark";
    std::string author = "PrismDashboard";
    std::string licenseHeader;
    std::filesystem::path outputDirectory = "generated";
    BuilderFeatureFlags features;
};

struct GeneratedFile {
    std::filesystem::path relativePath;
    std::string contents;
};

struct BuildCommand {
    std::string label;
    std::string command;
};

struct AppBuilderResult {
    bool success = false;
    std::string message;
    std::filesystem::path projectDirectory;
    std::filesystem::path zipPath;
    std::vector<GeneratedFile> files;
    std::vector<BuildCommand> commands;
};

class AppBuilder {
public:
    AppBuilder();

    AppBuilderResult GenerateProject(const AppBuilderConfig& config) const;
    std::vector<GeneratedFile> PreviewFiles(const AppBuilderConfig& config) const;
    std::vector<BuildCommand> BuildCommands(const AppBuilderConfig& config) const;
    std::vector<std::string> FrameworksFor(BuilderLanguage language) const;
    std::string Validate(const AppBuilderConfig& config) const;
    void RenderImGui(AppBuilderConfig& config);

private:
    std::vector<GeneratedFile> GeneratePython(const AppBuilderConfig& config) const;
    std::vector<GeneratedFile> GenerateCpp(const AppBuilderConfig& config) const;
    std::vector<GeneratedFile> GenerateCSharp(const AppBuilderConfig& config) const;
    std::vector<GeneratedFile> GenerateJava(const AppBuilderConfig& config) const;

    std::vector<BuildCommand> PythonCommands(const AppBuilderConfig& config) const;
    std::vector<BuildCommand> CppCommands(const AppBuilderConfig& config) const;
    std::vector<BuildCommand> CSharpCommands(const AppBuilderConfig& config) const;
    std::vector<BuildCommand> JavaCommands(const AppBuilderConfig& config) const;

    std::string ProjectSlug(const std::string& appName) const;
    std::string ClassName(const std::string& appName) const;
    std::string LicensePrefix(const AppBuilderConfig& config, const std::string& commentPrefix) const;
    bool WriteProject(const AppBuilderConfig& config, const std::vector<GeneratedFile>& files, std::filesystem::path& projectDirectory, std::string& error) const;
    bool CreateZip(const std::filesystem::path& projectDirectory, std::filesystem::path& zipPath, std::string& error) const;
    bool RunCommand(const std::string& command, const std::filesystem::path& workingDirectory) const;
};
