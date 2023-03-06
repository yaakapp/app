use tauri::{Runtime, Window};

const TRAFFIC_LIGHT_OFFSET_X: f64 = 15.0;
const TRAFFIC_LIGHT_OFFSET_Y: f64 = 18.0;

pub trait WindowExt {
    #[cfg(target_os = "macos")]
    fn position_traffic_lights(&self);
}

impl<R: Runtime> WindowExt for Window<R> {
    #[cfg(target_os = "macos")]
    fn position_traffic_lights(&self) {
        use cocoa::appkit::{NSView, NSWindow, NSWindowButton};
        use cocoa::foundation::NSRect;

        let window = self.ns_window().unwrap() as cocoa::base::id;

        let x = TRAFFIC_LIGHT_OFFSET_X;
        let y = TRAFFIC_LIGHT_OFFSET_Y;

        unsafe {
            let close = window.standardWindowButton_(NSWindowButton::NSWindowCloseButton);
            let miniaturize =
                window.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton);
            let zoom = window.standardWindowButton_(NSWindowButton::NSWindowZoomButton);

            let title_bar_container_view = close.superview().superview();

            let close_rect: NSRect = msg_send![close, frame];
            let button_height = close_rect.size.height;

            let title_bar_frame_height = button_height + y;
            let mut title_bar_rect = NSView::frame(title_bar_container_view);
            title_bar_rect.size.height = title_bar_frame_height;
            title_bar_rect.origin.y = NSView::frame(window).size.height - title_bar_frame_height;
            let _: () = msg_send![title_bar_container_view, setFrame: title_bar_rect];

            let window_buttons = vec![close, miniaturize, zoom];
            let space_between = NSView::frame(miniaturize).origin.x - NSView::frame(close).origin.x;

            for (i, button) in window_buttons.into_iter().enumerate() {
                let mut rect: NSRect = NSView::frame(button);
                rect.origin.x = x + (i as f64 * space_between);
                button.setFrameOrigin(rect.origin);
            }
        }
    }
}
