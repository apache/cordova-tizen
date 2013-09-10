<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="utf-8" indent="yes"/>
  

  <!-- global variables -->
  <xsl:variable name="key_return">
    <xsl:text>
</xsl:text>
  </xsl:variable>

  <xsl:variable name="key_tab">
    <xsl:text>	</xsl:text>
  </xsl:variable>

  <xsl:template match="/">
    <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;
</xsl:text>
    <xsl:comment>
Tizen Web Application Master page

@generated Tizen Web UI Builder
@attribute managed, readonly, volatile
</xsl:comment><xsl:text>
</xsl:text>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="description" content="A Tizen Web Application Template"/>
    
          <title></title>
          
	  <xsl:comment> frameworks </xsl:comment>
	  <xsl:value-of select="$key_return"/>
          <xsl:apply-templates select="//frameworks/script" mode="print_script"/>
          
          <xsl:comment> libraries </xsl:comment>
          <xsl:value-of select="$key_return"/>
          <xsl:apply-templates select="//libraries/script" mode="print_script"/>
          
          <xsl:comment> pages </xsl:comment>
          <xsl:value-of select="$key_return"/>
          <xsl:for-each select="//pages/page">
	    <xsl:variable name="managed_js_path" select="@managedJsPath"/>
	    <xsl:variable name="js_path" select="@jsPath"/>
            <script>
              <xsl:attribute name="src">
	        <xsl:value-of select="$managed_js_path"/>
              </xsl:attribute>
            </script>
            <xsl:value-of select="$key_return"/>
            <script>
              <xsl:attribute name="src">
	        <xsl:value-of select="$js_path"/>
              </xsl:attribute>
            </script>
            <xsl:value-of select="$key_return"/>
          </xsl:for-each>
          
          <xsl:comment> application entry </xsl:comment>
          <xsl:value-of select="$key_return"/>
          <xsl:apply-templates select="//entries/script" mode="print_script"/>

          <xsl:comment> style sheets </xsl:comment>
	  <xsl:value-of select="$key_return"/>
          <xsl:for-each select="//stylesheets/stylesheet">
            <link rel="stylesheet" type="text/css">
              <xsl:attribute name="href">
                <xsl:value-of select="@path"/>
              </xsl:attribute>
            </link>
          </xsl:for-each>
      </head>
      <body>
      </body>
    </html>

  </xsl:template>
  
  
  <xsl:template match="script" mode="print_script">
    <script>
      <xsl:attribute name="src">
        <xsl:value-of select="@path"/>
      </xsl:attribute>
      
      <!-- when framework element -->
      <xsl:for-each select="@data-framework-theme | @data-framework-viewport-scale">
        <xsl:attribute name="{name()}">
          <xsl:value-of select="."/>
        </xsl:attribute>
      </xsl:for-each>
    </script>
    <xsl:value-of select="$key_return"/>
  </xsl:template>
  
</xsl:stylesheet>
