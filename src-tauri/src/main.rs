#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  let result = tauri::Builder::default()
    .run(tauri::generate_context!());

  println!("{:?}", result)
}
