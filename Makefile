TARGET = iphone:clang:latest:16.5
ARCHS = arm64 arm64e
SYSROOT = $(THEOS)/sdks/iPhoneOS16.5.sdk

CONFIGURATION = Release

INSTALL_TARGET_PROCESSES = psychonautwiki

include $(THEOS)/makefiles/common.mk

APPLICATION_NAME = psychonautwiki

psychonautwiki_FILES = AppDelegate.swift RootViewController.swift
psychonautwiki_FRAMEWORKS = UIKit CoreGraphics WebKit
psychonautwiki_RESOURCES = Resources/*

include $(THEOS_MAKE_PATH)/application.mk
