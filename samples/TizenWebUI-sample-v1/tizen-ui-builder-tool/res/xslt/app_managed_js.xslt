<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:variable name="key_return">
    <xsl:text>
</xsl:text>
  </xsl:variable>

  <xsl:variable name="key_tab">
    <xsl:text>	</xsl:text>
  </xsl:variable>

  <xsl:template match="/">
    <xsl:text><![CDATA[/*******************************************************************************
 * Application initialization & Global app object creation 
 * 
 * @generated Tizen UI Builder
 * @attribute managed, readonly, volatile
 *******************************************************************************
*/

$(document).bind("mobileinit", function() {
});

function _app() {
}

]]></xsl:text>
  <xsl:variable name="startup_page" select="//page[@startup='true']"/><xsl:text>
_app.prototype.startPageId = </xsl:text><xsl:value-of select="concat('&quot;', $startup_page/@name, '&quot;;')"/><xsl:text>
_app.prototype.startPage = </xsl:text><xsl:value-of select="concat('&quot;', substring($startup_page/@pagePath, 1, string-length($startup_page/@pagePath) - 4), 'html&quot;;')"/><xsl:text><![CDATA[
_app.prototype.lastPageTransition = undefined;
_app.prototype.isFirstEnter = true;
_app.prototype.masterPagePath = location.href;

// global application object
var app = new _app();
]]></xsl:text>

  <xsl:text>
_app.prototype.init = function() {
	var rootDir = $.mobile.path.get(app.masterPagePath);
	var newPage;

</xsl:text>
  <xsl:apply-templates select="/tizenProject/pageSystem/pages/page"/>
  <xsl:text>
	_app.prototype.init = function() {};
};
</xsl:text>
  </xsl:template>

  <xsl:template match="page">
    <xsl:variable name="page_name" select="@name"/>
    <xsl:variable name="html_path" select="concat('&quot;', @htmlPath, '&quot;')"/>
    <xsl:variable name="class_name">
      <xsl:value-of select="concat('_', $page_name, '_page')"/>
    </xsl:variable>
      <xsl:value-of select="concat($key_tab, 'newPage = new ', $class_name, '();', $key_return)"/>
      <xsl:value-of select="concat($key_tab, 'newPage.init_page(', @startup, ');', $key_return)"/>
      <xsl:value-of select="concat($key_tab, 'pageManager.addPage(newPage, $.mobile.path.makeUrlAbsolute(', $html_path, ', rootDir));', $key_return, $key_return)"/>
  </xsl:template>
</xsl:stylesheet>
