# Iconos de líneas LoL (SVG)

Incluye estos archivos en: static/img/roles/

Archivos:
- top.svg
- jungle.svg
- mid.svg
- adc.svg
- support.svg

Ejemplo HTML:
<img src="{{ url_for('static', filename='img/roles/top.svg') }}" alt="Top">

Ejemplo JS (mapeo):
const laneIconMap = {
  top: "/static/img/roles/top.svg",
  jungle: "/static/img/roles/jungle.svg",
  mid: "/static/img/roles/mid.svg",
  adc: "/static/img/roles/adc.svg",
  support: "/static/img/roles/support.svg"
};

Ejemplo CSS para chips:
.lane-icon-img {
  width: 18px;
  height: 18px;
  display: inline-block;
  object-fit: contain;
}