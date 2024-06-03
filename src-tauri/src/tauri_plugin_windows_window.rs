use hex_color::HexColor;
use tauri::{Manager, Runtime, Window, WindowEvent};

use std::mem::transmute;
use std::{ffi::c_void, mem::size_of, ptr};
use tauri::plugin::{Builder, TauriPlugin};

use windows::Win32::UI::Controls::{
    WTA_NONCLIENT, WTNCA_NODRAWICON, WTNCA_NOMIRRORHELP, WTNCA_NOSYSMENU,
};

use windows::Win32::Foundation::COLORREF;
use windows::Win32::Foundation::{BOOL, HWND};
use windows::Win32::Graphics::Dwm::DwmSetWindowAttribute;
use windows::Win32::Graphics::Dwm::DWMWA_CAPTION_COLOR;
use windows::Win32::Graphics::Dwm::DWMWA_USE_IMMERSIVE_DARK_MODE;
use windows::Win32::UI::Controls::SetWindowThemeAttribute;
use windows::Win32::UI::Controls::WTNCA_NODRAWCAPTION;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows_window")
        .on_window_ready(|window| {
            #[cfg(target_os = "windows")]
            setup_win_window(window);
            return;
        })
        .build()
}

fn hex_color_to_colorref(color: HexColor) -> COLORREF {
    // TODO: Remove this unsafe, This operation doesn't need to be unsafe!
    unsafe { COLORREF(transmute::<[u8; 4], u32>([color.r, color.g, color.b, 0])) }
}

struct WinThemeAttribute {
    #[allow(dead_code)]
    flag: u32,
    #[allow(dead_code)]
    mask: u32,
}

#[cfg(target_os = "windows")]
fn update_bg_color(hwnd: &HWND, bg_color: HexColor) {
    let use_dark_mode = BOOL::from(true);

    let final_color = hex_color_to_colorref(bg_color);

    unsafe {
        DwmSetWindowAttribute(
            HWND(hwnd.0),
            DWMWA_USE_IMMERSIVE_DARK_MODE,
            ptr::addr_of!(use_dark_mode) as *const c_void,
            size_of::<BOOL>().try_into().unwrap(),
        )
        .unwrap();

        DwmSetWindowAttribute(
            HWND(hwnd.0),
            DWMWA_CAPTION_COLOR,
            ptr::addr_of!(final_color) as *const c_void,
            size_of::<COLORREF>().try_into().unwrap(),
        )
        .unwrap();

        let flags = WTNCA_NODRAWCAPTION | WTNCA_NODRAWICON;
        let mask = WTNCA_NODRAWCAPTION | WTNCA_NODRAWICON | WTNCA_NOSYSMENU | WTNCA_NOMIRRORHELP;
        let options = WinThemeAttribute { flag: flags, mask };

        SetWindowThemeAttribute(
            HWND(hwnd.0),
            WTA_NONCLIENT,
            ptr::addr_of!(options) as *const c_void,
            size_of::<WinThemeAttribute>().try_into().unwrap(),
        )
        .unwrap();
    }
}

#[cfg(target_os = "windows")]
pub fn setup_win_window<R: Runtime>(window: Window<R>) {
    let win_handle = window.hwnd().unwrap();
    let win_clone = win_handle.clone();

    let event_id = window.listen("yaak_bg_changed", move |ev| {
        let payload = serde_json::from_str::<&str>(ev.payload()).unwrap().trim();
        let color = HexColor::parse_rgb(payload).unwrap();
        update_bg_color(&HWND(win_clone.0), color);
    });

    let h = window.app_handle().clone();
    window.on_window_event(move |e| match e {
        WindowEvent::Destroyed => {
            h.unlisten(event_id);
        }
        _ => {}
    })
}
