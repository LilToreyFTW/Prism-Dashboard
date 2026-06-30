cmake_minimum_required(VERSION 3.16)
project(PrismDashboard)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB PRISM_SOURCES CONFIGURE_DEPENDS src/*.cpp)

add_executable(PrismDashboard ${PRISM_SOURCES})

target_include_directories(PrismDashboard PRIVATE src auth)
